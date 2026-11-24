const API = "http://localhost:3000";

const get = id => document.getElementById(id);

// Save data in db.json
async function save(table, data) {
    await fetch(`${API}/${table}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}

// Add User
async function addUser() {
    let name = get("username").value.trim();

    if (!name)
        return alert("Enter user name");

    await save("users", { name });

    get("username").value = "";
    display();
}

// Add Book
async function addBook() {
    let name = get("bookname").value.trim();
    let author = get("author").value.trim();

    if (!name || !author)
        return alert("Enter book details");

    await save("books", { name, author });

    get("bookname").value = "";
    get("author").value = "";
    display();
}

// Withdraw Book
async function withdraw() {
    let userId = get("uid").value.trim();
    let bookId = get("bid").value.trim();

    let users = await fetch(API + "/users")
        .then(res => res.json());

    let books = await fetch(API + "/books")
        .then(res => res.json());

    let history = await fetch(API + "/history")
        .then(res => res.json());

    if (!users.some(u => u.id === userId) ||
        !books.some(b => b.id === bookId)) {
        return alert("Invalid User or Book ID");
    }

    if (history.some(h =>
        h.bookId === bookId &&
        h.status === "Withdrawn")) {
        return alert("Book not available");
    }

    let today = new Date();
    let due = new Date();

    due.setDate(today.getDate() + 7);

    await save("history", {
        userId,
        bookId,
        withdrawalDate: today.toLocaleDateString(),
        dueDate: due.toLocaleDateString(),
        status: "Withdrawn"
    });

    alert("Book withdrawn successfully");

    get("uid").value = "";
    get("bid").value = "";

    display();
}

// Return Book
async function returnBook(id) {
    await fetch(`${API}/history/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: "Returned",
            returnDate: new Date().toLocaleDateString()
        })
    });

    alert("Book returned successfully");
    display();
}

// Display Records
async function display() {
    let users = await fetch(API + "/users")
        .then(res => res.json());

    let books = await fetch(API + "/books")
        .then(res => res.json());

    let history = await fetch(API + "/history")
        .then(res => res.json());

    get("users").innerHTML = users.map(u =>
        `<p>ID: ${u.id} | Name: ${u.name}</p>`
    ).join("");

    get("books").innerHTML = books.filter(b =>
        !history.some(h =>
            h.bookId === b.id &&
            h.status === "Withdrawn")
    ).map(b =>
        `<p>ID: ${b.id} | ${b.name} | ${b.author}</p>`
    ).join("");

    get("history").innerHTML = history.map(h => `
        <p>
            User ID: ${h.userId} |
            Book ID: ${h.bookId} |
            Withdrawn: ${h.withdrawalDate} |
            Due: ${h.dueDate} |
            Status: ${h.status} |
            Returned: ${h.returnDate || "-"}

            ${h.status === "Withdrawn" ?
                `<button onclick="returnBook('${h.id}')">
                    Return
                </button>` : ""}
        </p>
    `).join("");
}

display();
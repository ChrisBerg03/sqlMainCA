const baseUrl = "https://sqlca.onrender.com/";

async function getData() {
    const accessToken = localStorage.getItem("accessToken");

    try {
        const res = await fetch(`${baseUrl}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to fetch user data. Please log in again.");
    }
}

async function getPosts() {
    try {
        const res = await fetch(`${baseUrl}posts`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch posts");
        }

        const posts = await res.json();

        for (const post of posts) {
            const commentsRes = await fetch(
                `${baseUrl}posts/${post.id}/comments`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!commentsRes.ok) {
                throw new Error(`Failed to fetch comments for post ${post.id}`);
            }

            post.comments = await commentsRes.json();
        }

        renderPosts(posts);
    } catch (error) {
        console.error("Error fetching posts and comments:", error);
        alert("Failed to fetch posts. Please try again later.");
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    const accessToken = localStorage.getItem("accessToken");

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.setAttribute("id", `post-${post.id}`);

        // Post content
        postDiv.innerHTML = `
            <img src="${
                post.imageUrl ||
                "https://media.istockphoto.com/id/1500807425/fr/vectoriel/image-introuvable-ic%C3%B4ne-vectorielle-design.jpg?s=612x612&w=0&k=20&c=Z-dlqJZ1zxDNppQEyWz1cPFJxcAbPHWhPfJvfhFN-kE="
            }" alt="Post image"/>
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>Posted by: ${post.username} on ${new Date(
            post.created_at
        ).toLocaleDateString()}</small>
        `;

        const commentsDiv = document.createElement("div");
        commentsDiv.classList.add("comments");

        const commentsHeader = document.createElement("h4");
        commentsHeader.textContent = "Comments:";
        commentsDiv.appendChild(commentsHeader);

        if (post.comments && post.comments.length > 0) {
            post.comments.forEach((comment) => {
                const commentParagraph = document.createElement("p");
                commentParagraph.innerHTML = `<strong>${
                    comment.username
                }:</strong> ${comment.comment} <small>(${new Date(
                    comment.created_at
                ).toLocaleDateString()})</small>`;
                commentsDiv.appendChild(commentParagraph);
            });
        } else {
            commentsDiv.innerHTML += `<p>No comments yet.</p>`;
        }

        // Comment form
        if (accessToken) {
            const commentForm = document.createElement("form");
            commentForm.innerHTML = `
                <textarea class="commentTextarea" placeholder="Add your comment"></textarea>
                <button type="submit">Add Comment</button>
            `;

            commentForm.addEventListener("submit", (e) => {
                e.preventDefault();
                createComment(post.id);
            });

            commentsDiv.appendChild(commentForm);
        } else {
            commentsDiv.innerHTML += `<p>Login to add a comment</p>`;
        }
        postDiv.appendChild(commentsDiv);
        postsContainer.appendChild(postDiv);
    });
}

getPosts();

async function getComments(postId) {
    try {
        const res = await fetch(`${baseUrl}posts/${postId}/comments`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch comments");
        }

        const comments = await res.json();

        const commentsDiv = document.querySelector(`#post-${postId} .comments`);

        commentsDiv.innerHTML = "<h4>Comments:</h4>";

        if (comments.length > 0) {
            comments.forEach((comment) => {
                const commentParagraph = document.createElement("p");
                commentParagraph.innerHTML = `<strong>${
                    comment.username
                }:</strong> ${comment.comment} <small>(${new Date(
                    comment.created_at
                ).toLocaleDateString()})</small>`;
                commentsDiv.appendChild(commentParagraph);
            });
        } else {
            commentsDiv.innerHTML += "<p>No comments yet.</p>";
        }
    } catch (error) {
        console.error("Error fetching comments:", error);
        alert("Failed to fetch comments. Please try again later.");
    }
}

async function login() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    try {
        const res = await fetch(`${baseUrl}login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Login failed");
        }

        const data = await res.json();
        localStorage.setItem("accessToken", data.accessToken);
        window.location.reload();
        alert("Login successful!");
    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed. Please check your credentials.");
    }
}

async function register() {
    const email = document.querySelector("#email").value;
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;

    try {
        const res = await fetch(`${baseUrl}register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                username,
                password,
            }),
        });

        if (!res.ok) {
            throw new Error("Registration failed");
        }

        const data = await res.json();
        alert("Registration successful! You can now log in.");
    } catch (error) {
        console.error("Error during registration:", error);
        alert("Registration failed. Please try again.");
    }
}

async function createPost() {
    const title = document.querySelector("#postTitle").value;
    const content = document.querySelector("#postContent").value;
    const imageUrl = document.querySelector("#postImageUrl").value;

    const accessToken = localStorage.getItem("accessToken");

    try {
        const res = await fetch(`${baseUrl}add-post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                title,
                content,
                imageUrl,
            }),
        });

        if (!res.ok) {
            throw new Error("Failed to create post");
        }

        const data = await res.json();
        alert("Post created successfully!");
        window.location.reload();
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post. Please try again later.");
    }
}

async function createComment(postId) {
    const commentTextarea = document.querySelector(
        `#post-${postId} .commentTextarea`
    );
    const comment = commentTextarea.value.trim();

    if (!comment) {
        alert("Comment cannot be empty!");
        return;
    }

    const accessToken = localStorage.getItem("accessToken");

    try {
        const res = await fetch(`${baseUrl}posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ comment }),
        });

        if (!res.ok) {
            throw new Error("Failed to add comment");
        }

        const data = await res.json();

        getComments(postId);
    } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
    }
}

document.querySelector("#createPostForm").addEventListener("submit", (e) => {
    e.preventDefault();
    createPost();
});

document.querySelector("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

document.querySelector("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    register();
});

document.addEventListener("DOMContentLoaded", () => {
    const accessToken = localStorage.getItem("accessToken");

    // createPost hide
    const createPostForm = document.querySelector("#createPostForm");
    if (!accessToken) {
        createPostForm.style.display = "none";
    }

    // register and login hide
    const registerForm = document.querySelector("#registerForm");
    const loginForm = document.querySelector("#loginForm");
    if (accessToken) {
        registerForm.style.display = "none";
        loginForm.style.display = "none";
    }
});

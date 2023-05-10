"use strict";

const endpoint = "https://projekt-merve-nour-default-rtdb.firebaseio.com/";
let posts = [];

window.addEventListener("load", initApp);

function initApp() {
  console.log("så dæh nu dåh");
  updatePostsGrid();
  //--------------CREATEPOST-----------------//

  document
    .querySelector("#open-create-post-dialog")
    .addEventListener("click", showCreatePost);

  document
    .querySelector("#close-create-post-dialog")
    .addEventListener("click", hideCreatePost);
 document
   .querySelector("#chuliki")
   .addEventListener("submit", createPostClicked);

  document
    .querySelector("#form-create-post")
    .addEventListener("submit", createPostClicked);

  //-------------UPDATE POST/ DIALOG CLICKED-------------//

  document
    .querySelector("#form-update-post")
    .addEventListener("submit", updatePostClicked);

  document
    .querySelector("#btn-close-dialog")
    .addEventListener("click", hidePostClicked);

  //-------------SEARCH SORT FILTER-------------//

  document
    .querySelector("#input-search")
    .addEventListener("input", searchPosts);

  /*document
    .querySelector("#input-search")
    .addEventListener("keyup", inputSearchChanged);
  document
    .querySelector("#input-search")
    .addEventListener("search", inputSearchChanged);
  document
    .querySelector("#select-sort-by")
    .addEventListener("change", sortPosts);*/
}

// ============== events ============== //

function cancelDelete() {
  console.log("cancel btn clicked");
  document.querySelector("#dialog-delete-post").close();
}

function cancelCreate() {
  console.log("cancel create btn clicked");
  document.querySelector("#dialog-create-post").close();
}

// ============== posts ============== //
// Get all posts - HTTP Method: GET
async function getPosts() {
  const response = await fetch(`${endpoint}/posts.json`);
  const data = await response.json();
  const postObjects = Object.entries(data).map(([id, post]) => ({
    ...post,
    id,
  }));
  return postObjects;
}

// Generate HTML for each post and append it to the #posts element
function showPosts(listOfPosts) {
  const postsContainer = document.querySelector("#posts");
  postsContainer.innerHTML = "";

  for (const post of listOfPosts) {
    const html = /*html*/ `
      <article class="grid-item">
        <img src="${post.image}" data-id="${post.id}" />
      </article>
    `;

    postsContainer.insertAdjacentHTML("beforeend", html);
  }

  // Add a click event listener to the posts container
  postsContainer.addEventListener("click", function (event) {
    // Check if an image was clicked
    if (event.target.tagName === "IMG") {
      // Find the clicked post by its id
      const postId = event.target.dataset.id;
      const post = listOfPosts.find((post) => post.id === postId);

      // If a post was found, show its details
      if (post) {
        imageClicked(post);
      }
    }
  });
}

//===================SEARCH SORT FILTER-------------//

function searchPosts() {
  const query = document.querySelector("#input-search").value.toLowerCase();
  const filteredPosts = posts.filter((post) => {
    return (
      post.description.toLowerCase().includes(query) ||
      post.name.toLowerCase().includes(query) ||
      post.song.toLowerCase().includes(query) ||
      post.year.toString().includes(query)
    );
  });
  showPosts(filteredPosts);
}

//------create post-------------------------------/

function showCreatePost() {
  console.log("opened create post dialog!");
  const createPostDialog = document.querySelector("#create-post-dialog");
  if (createPostDialog.showModal) {
    createPostDialog.showModal();
  } else {
    createPostDialog.style.display = "block";
    document.querySelector("#overlay").style.display = "block";
  }
}

function hideCreatePost() {
  console.log("closed create post dialog!");
  const createPostDialog = document.querySelector("#create-post-dialog");
  if (createPostDialog.close) {
    createPostDialog.close();
  } else {
    createPostDialog.style.display = "none";
    document.querySelector("#overlay").style.display = "none";
  }
}

function createPostClicked(event) {
  console.log("test");
  event.preventDefault(); // Prevent form submission and page refresh
  const form = document.querySelector("#chuliki");
  console.log("hi");
  console.log(form.image); // Check the value of form.image
  console.log(form.description); // Check the value of form.description
  const image = form.image.value;
  const description = form.description.value;
  const name = form.name.value;
  const year = form.year.value;
  const song = form.song.value;
  createPost(image, description, name, year, song);
  form.reset();
}

async function createPost(image, description, name, year, song) {
  console.log("test");
  const newPost = {
    image: image,
    description: description,
    name: name,
    year: year,
    song: song,
  };
  const json = JSON.stringify(newPost);
  const response = await fetch(`${endpoint}/posts.json`, {
    method: "POST",
    body: json,
  });
  if (response.ok) {
    console.log("Data added to FireBase!");
    updatePostsGrid();
  }
}

async function updatePostsGrid() {
  posts = await getPosts(); // get posts from rest endpoint and save in global variable
  showPosts(posts); // show all posts (append to the DOM) with posts as argument
}

//-------------POST CLICKED DIALOG OPENED--------------------/

// called when image is clicked
function imageClicked(postObject) {
  console.log(postObject); // Debugging statement

  document.querySelector("#dialog-image").src = postObject.image;

  document.querySelector("#name").textContent = postObject.name;
  document.querySelector("#year").textContent = postObject.year;
  document.querySelector("#song").textContent = postObject.song;
  document.querySelector("#Description").textContent = postObject.description;

  // Add event listeners for delete and update buttons in the detail view
  document
    .querySelector("#btn-delete")
    .addEventListener("click", () => deleteClicked(postObject));
  document
    .querySelector("#btn-update")
    .addEventListener("click", () => updateClicked(postObject));

  // Open the dialog
  document.querySelector("#post-clicked-dialog").showModal();
}

//-------closes dialog when "close" is clicked -----
function hidePostClicked() {
  console.log("closed post clicked dialog!");
  const postClickedDialog = document.querySelector("#post-clicked-dialog");
  if (postClickedDialog.close) {
    postClickedDialog.close();
  } else {
    postClickedDialog.style.display = "none";
    document.querySelector("#overlay").style.display = "none";
  }
}

//-------pop up, deletes post, closes dialog and updates grid---
async function deleteClicked(postObject) {
  // Ask the user to confirm the deletion
  const confirmed = confirm("Are you sure you want to delete this post?");

  // If the user confirmed the deletion
  if (confirmed) {
    const postId = postObject.id;
    const response = await fetch(`${endpoint}/posts/${postId}.json`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Post successfully deleted!");
      updatePostsGrid();

      // Close the dialog after post is deleted
      const postClickedDialog = document.querySelector("#post-clicked-dialog");
      postClickedDialog.close();
    } else {
      alert("Error deleting the post. Please try again.");
    }
  }
}

//-------------UPDATE POST --------------------/

function updateClicked(postObject) {
  // Implement update functionality
}

function getPostById(id) {
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === id) {
      return posts[i];
    }
  }
  return null; // return null if post with given id not found
}

function addPost(title, content) {
  // code to add post to array
}

function getPostById(id) {
  // code to retrieve post by id from array
}

function updatePost(id, newTitle, newContent) {
  // code to update post in array
}

function deletePost(id) {
  // code to delete post from array
}

function showUpdatePostDialog(postId) {
  var post = getPostById(postId);
  if (post && post.title && post.body) {
    document.getElementById("update-post-title").value = post.title;
    document.getElementById("update-post-body").value = post.body;
    document.getElementById("update-post-id").value = postId;
    document.getElementById("update-post-dialog").classList.add("show");
  } else {
    console.log("Post or post properties are undefined");
  }
}

function updateClicked(postObject) {
  if (
    !postObject ||
    !postObject.image ||
    !postObject.description ||
    !postObject.name ||
    !postObject.year ||
    !postObject.song
  ) {
    console.error("Invalid post object passed to showUpdatePostDialog");
    return;
  }

  showUpdatePostDialog(postObject);
}

async function updatePostClicked(event) {
  event.preventDefault();
  const form = event.target;
  const image = form.image.value;
  const description = form.description.value;
  const name = form.name.value;
  const year = form.year.value;
  const song = form.song.value;
  const postId = form.postId.value; // Assuming you added a hidden input with postId in the update post form

  const updatedPost = {
    image,
    description,
    name,
    year,
    song,
  };

  const response = await fetch(`${endpoint}/posts/${postId}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedPost),
  });

  if (response.ok) {
    // Close the update post dialog
    document.querySelector("#dialog-update-post").close();

    // Update the posts grid
    updatePostsGrid();
  } else {
    alert("Error updating the post. Please try again.");
  }
}

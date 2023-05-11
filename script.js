"use strict";

const endpoint = "https://projekt-merve-nour-default-rtdb.firebaseio.com/";
let posts = [];

window.addEventListener("load", initApp);

//====================INITAPP=================================//

function initApp() {
  console.log("så dæh nu dåh");
  updatePostsGrid();

  //--------------CREATEPOST------------------------//
  document
    .querySelector("#open-create-post-dialog")
    .addEventListener("click", showCreatePost);

  document
    .querySelector("#close-create-post-dialog")
    .addEventListener("click", hideCreatePost);

  document
    .querySelector("#form-create-post")
    .addEventListener("submit", createPostClicked);

  //-------------UPDATE POST/ DIALOG CLICKED---------//
  document
    .querySelector("#btn-open-update-post-dialog")
    .addEventListener("click", showUpdatePost);

  document
    .querySelector("#close-update-post-dialog")
    .addEventListener("click", hideUpdatePost);

  document
    .querySelector("#form-update-post")
    .addEventListener("submit", updatePostClicked);

  //-------------SEARCH SORT FILTER------------------//
  document
    .querySelector("#input-search")
    .addEventListener("input", searchPosts);

  //-------------SORT POSTS--------------------------//
  document.querySelector("#sort-options").addEventListener("change", sortPosts);
}

// ============== EVENTS ============== //

function cancelDelete() {
  console.log("cancel btn clicked");
  document.querySelector("#dialog-delete-post").close();
}

function cancelCreate() {
  console.log("cancel create btn clicked");
  document.querySelector("#dialog-create-post").close();
}

// ====================== get POSTS =========================== //
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
function showPosts(listOfPosts) {
  const postsContainer = document.querySelector("#posts");
  postsContainer.innerHTML = "";

  for (const post of listOfPosts) {
    const article = document.createElement("article");
    article.classList.add("grid-item");

    const img = document.createElement("img");
    img.src = post.image;
    img.setAttribute("data-id", post.id);

    article.appendChild(img);
    postsContainer.appendChild(article);
  }

  postsContainer.addEventListener("click", function (event) {
    if (event.target.tagName === "IMG") {
      const postId = event.target.dataset.id;
      const post = listOfPosts.find((post) => post.id === postId);

      if (post) {
        imageClicked(post);
      }
    }
  });
}


//===================SEARCH SORT FILTER===========================//

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
function sortPosts(event) {
  const option = event.target.value;

  if (option === "year") {
    posts.sort((a, b) => b.year - a.year);
  } else if (option === "song") {
    posts.sort((a, b) => a.song.localeCompare(b.song));
  }
  showPosts(posts);
}

//======================CREATE POST===============================//

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
  const closeCreateButton = document.querySelector("#close-create-post-dialog");
  const createPostDialog = document.querySelector("#create-post-dialog");
  if (closeCreateButton && createPostDialog) {
    if (createPostDialog.close) {
      createPostDialog.close();
    } else {
      createPostDialog.style.display = "none";
      document.querySelector("#overlay").style.display = "none";
    }
  } else {
    console.error("The button or dialog element is not found in the HTML.");
  }
}

function createPostClicked(event) {
  event.preventDefault(); 
  const form = this;
  console.log("in form");
  console.log(form);
  const image = form.image.value;
  const description = form.description.value;
  const name = form.name.value;
  const year = form.year.value;
  const song = form.song.value;
  createPost(image, description, name, year, song);
  form.reset();
  document.querySelector("#create-post-dialog").close();
}

async function createPost(image, description, name, year, song) {
  const newPost = {
    image: image,
    description: description,
    name: name,
    year: year,
    song: song,
  };
  const json = JSON.stringify(newPost);
  console.log(json);

  const response = await fetch(`${endpoint}/posts.json`, {
    method: "POST",
    body: json,
  });

  if (response.ok) {
    console.log("Data added to Firebase!");

    // Show success pop-up and hide it after 3 seconds
    const successPopup = document.querySelector("#create-success-popup");
    successPopup.style.display = "block";
    setTimeout(() => {
      successPopup.style.display = "none";
    }, 3000);

    updatePostsGrid();
  } else {
    console.error("Error posting the post.");

    // Show error pop-up and hide it after 3 seconds
    const errorPopup = document.querySelector("#create-error-popup");
    errorPopup.style.display = "block";
    setTimeout(() => {
      errorPopup.style.display = "none";
    }, 3000);
  }
}

async function updatePostsGrid() {
  posts = await getPosts(); // get posts from rest endpoint and save in global variable
  showPosts(posts); // show all posts (append to the DOM) with posts as argument
}

//======================POST CLICKED DIALOG OPENED======================/

// called when image is clicked
function imageClicked(postObject) {
  console.log(postObject);

  document.querySelector("#dialog-image").src = postObject.image;
  document.querySelector("#name").textContent = postObject.name;
  document.querySelector("#year").textContent = postObject.year;
  document.querySelector("#song").textContent = postObject.song;
  document.querySelector("#Description").textContent = postObject.description;

  // Add event listeners for delete, update and close buttons in the detail view
  document
    .querySelector("#btn-delete")
    .addEventListener("click", () => deleteClicked(postObject));
  document
    .querySelector("#btn-open-update-post-dialog")
    .addEventListener("click", () => showUpdatePost(postObject));
  document
    .querySelector("#btn-close-dialog")
    .addEventListener("click", hidePostClicked);

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
  const confirmed = confirm("Are you sure you want to delete this post?");

  if (confirmed) {
    const postId = postObject.id;
    const response = await fetch(`${endpoint}/posts/${postId}.json`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Post successfully deleted!");
      updatePostsGrid();

      const postClickedDialog = document.querySelector("#post-clicked-dialog");
      postClickedDialog.close();
    } else {
      alert("Error deleting the post. Please try again.");
    }
  }
}


//======================UPDATE POST ======================//

function showUpdatePost(postObject) {
  // Close the post clicked dialog
  const postClickedDialog = document.querySelector("#post-clicked-dialog");
  if (postClickedDialog.close) {
    postClickedDialog.close();
  } else {
    postClickedDialog.style.display = "none";
    document.querySelector("#overlay").style.display = "none";
  }

  console.log("opened update post dialog!");

  const updatePostDialog = document.querySelector("#update-post-dialog");
  const updateForm = document.querySelector("#form-update-post");

  // Get postId from the postObject
  let postId = postObject.id;

  // Prefill the form with the current post information
  if (updateForm) {
    updateForm.setAttribute("data-post-id", postId);
    updateForm.image.value = postObject.image;
    updateForm.description.value = postObject.description;
    updateForm.name.value = postObject.name;
    updateForm.year.value = postObject.year;
    updateForm.song.value = postObject.song;
  } else {
    console.error("The #form-update-post element is not found in the HTML.");
  }

  if (!updatePostDialog.open) {
    if (updatePostDialog.showModal) {
      updatePostDialog.showModal();
    } else {
      updatePostDialog.style.display = "block";
      document.querySelector("#overlay").style.display = "block";
    }
  }
}

function hideUpdatePost() {
  console.log("closed update post dialog!");
  const updatePostDialog = document.querySelector("#update-post-dialog");
  if (updatePostDialog.close) {
    updatePostDialog.close();
  } else {
    updatePostDialog.style.display = "none";
    document.querySelector("#overlay").style.display = "none";
  }
}

function updatePostClicked(event) {
  event.preventDefault();
  const form = this;
  console.log("in form");
  console.log(form);
  const image = form.image.value;
  const description = form.description.value;
  const name = form.name.value;
  const year = form.year.value;
  const song = form.song.value;

  const postId = form.getAttribute("data-post-id"); 

  updatePost(postId, image, description, name, year, song);
  form.reset();
  document.querySelector("#update-post-dialog").close();
}

async function updatePost(postId, image, description, name, year, song) {
  const updatedPost = {
    image: image,
    description: description,
    name: name,
    year: year,
    song: song,
  };
  const json = JSON.stringify(updatedPost);
  console.log(json);

  const response = await fetch(`${endpoint}/posts/${postId}.json`, {
    method: "PATCH", // Use PATCH method to update the existing post
    body: json,
  });

  if (response.ok) {
    console.log("Data updated on FireBase!");

    // Show success pop-up and hide it after 3 seconds
    const successPopup = document.querySelector("#success-popup");
    successPopup.style.display = "block";
    setTimeout(() => {
      successPopup.style.display = "none";
    }, 3000);

    updatePostsGrid();
  } else {
    console.log("Error updating the post.");

    // Show error pop-up and hide it after 3 seconds
    const errorPopup = document.querySelector("#error-popup");
    errorPopup.style.display = "block";
    setTimeout(() => {
      errorPopup.style.display = "none";
    }, 3000);
  }
}

async function updatePostsGrid() {
  posts = await getPosts();
  posts.sort((a, b) => b.id.localeCompare(a.id)); // Sort by id (newest first)
  showPosts(posts);
}

// yo can remove lodash if you want, lodash was used in case where we had to write the name of our post/blog in the search bar (google search bar) but as we are using readmore as a link to the page of post you do not need the lodash any more

import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import _ from "lodash"
import mongoose from "mongoose";

const homeStartingContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi totam rem amet provident culpa, molestias quas explicabo fugiat. Consequatur, debitis? Natus aut illo ut. Autem labore obcaecati deserunt nulla architecto, eius minusLorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi totam rem amet provident culpa, molestias quas explicabo fugiat. Consequatur, debitis? Natus aut illo ut. Autem labore obcaecati deserunt nulla architecto, eius minus."
const aboutContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi totam rem amet provident culpa, molestias quas explicabo fugiat. Consequatur, debitis? Natus aut illo ut. Autem labore obcaecati deserunt nulla architecto, eius minus."
const contactContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore commodi totam rem amet provident culpa, molestias quas explicabo fugiat. Consequatur, debitis? Natus aut illo ut. Autem labore obcaecati deserunt nulla architecto, eius minus."

const app = express()
const port = 8000;
let posts = [];

mongoose.connect("mongodb://0.0.0.0:27017/blogDB", { useNewUrlParser: true });

const postSchema = {
  title: String,
  content: String,
};
const Post = mongoose.model("Post", postSchema);
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))


// i have used async and await because the find(),findOne() and save() do not accept the callbacks you can use promise as well but don't use callbacks at all or you will get an error on the webpage that find()/save() does not accept callbacks

app.get("/", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error", { errorMessage: "Something went wrong!" });
  }
});

app.get("/about", (req, res) => {
  res.render("about", { contentAbout: aboutContent })
})
app.get("/contact", (req, res) => {
  res.render("contact", { contentContact: contactContent })
})
app.get("/compose", (req, res) => {
  res.render("compose")
})
app.post("/compose", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).render("error", { errorMessage: "Something went wrong!" });
  }
});


app.get("/posts/:postId", async function (req, res) {
  const requestedPostId = req.params.postId;
  try {
    const post = await Post.findOne({ _id: requestedPostId });
    if (!post) {
      throw new Error("Post not found");
    }
    res.render("post", {
      title: post.title,
      content: post.content
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(404).render("error", { errorMessage: "Post not found!" });
  }
});
app.listen(port, () => {
  console.log(`We are running on ${port}`);
})
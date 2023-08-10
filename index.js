// yo can remove lodash if you want, lodash was used in case where we had to write the name of our post/blog in the search bar (google search bar) but as we are using readmore as a link to the page of post you do not need the lodash any more

import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import _ from "lodash"
import mongoose from "mongoose";
import session from "express-session";


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

const selfSchema = {
  email: String,
  password: String,
  selfBlog: postSchema
}

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", selfSchema);

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: false,
  })
);


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

app.post("/toggle-dark-mode", (req, res) => {
  req.session.darkMode = !req.session.darkMode;
  res.sendStatus(200);
});


app.get("/about", (req, res) => {
  res.render("about", { contentAbout: aboutContent })
})

app.get("/contact", (req, res) => {
  res.render("contact", { contentContact: contactContent })
})

app.get("/compose", (req, res) => {
  if (req.session.isAuthenticated) {
    res.render("compose");
  } else {
    res.send("Please login first");
  }
});

app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/register",(req,res)=>{
  res.render("register")
})

app.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.username });

    if (existingUser) {
      // User with the given email already exists
      res.send("You are already registered, please go to the login page.");

    } else {
      // Create a new user and save it to the database
      const user = new User({
        email: req.body.username,
        password: req.body.password
      });
      await user.save();
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).render("error", { errorMessage: "Something went wrong!" });
  }
});
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

app.post("/login", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      email: req.body.username,
      password: req.body.password,
    });

    if (existingUser) {
      // User with the given email and password exists
      req.session.isAuthenticated = true;
      req.session.user = { email: req.body.username };
      res.redirect("/");
    } else {
      // Invalid login credentials
      res.send("Your email or password is not correct or you are not registered yet");
    }
  } catch (error) {
    console.error("Error saving user:", error);
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
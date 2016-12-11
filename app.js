// Create a list of blog posts formatted
// in a way that's usable in our templates
var blogPosts = {
  "my-first-webpage": {
    "title": "My first webpage",
    "excerpt": "I've taken a course at Code at Uni and created my own personal website with HTML and CSS.",
    "content": "\
    <p>My first paragraph as well!</p>\
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vehicula ante nec neque lobortis, fringilla convallis elit dignissim.</p>\
    "
  },
  "hello-world": {
    "title": "Hello World",
    "excerpt": "This is the start of my online journal. I will take about my journey in learning how to code!",
    "content": "\
    <p>Hello World this is a paragraph.</p>\
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In vehicula ante nec neque lobortis, fringilla convallis elit dignissim.</p>\
    "
  },
};


var express = require('express'); 
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

var mailgun = require("mailgun-js") ({
  apiKey: 'key-7e7e5982aa568bb89a1d2919c4790528',
  domain: 'sandboxf0bc1f079a6e43baa7fd1b6d11cd9b06.mailgun.org'

});



var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Path to our public directory
app.use(express.static('public'));

// Register '.handlebars' extension with exphbs
app.engine('.hbs', exphbs({extname: '.hbs'}));
// Set our default template engine to "handlebars"
app.set('view engine', '.hbs');

// Homepage
app.get('/', function (request, response) {
  response.render('home.hbs');
});

// Contact Page
app.get('/contact', function(request, response){
  response.render('contact.hbs');
});

//About route 
app.get('/About', function(request, response){
  response.send('This the boring about page');
  
});
//blog route
app.get('/blog', function(request, response){
  
  var listOfPosts = [];
 var blogPostKeys = Object.keys(blogPosts);
 
 //  objectKeys = ['my-first webpage', 'hello-world'];
 
 blogPostKeys.forEach(function(blogId){
 
  var post = blogPosts[blogId];
  post.id = blogId;
 listOfPosts.push(post);
   
 });
 
  response.render('blog', {
    posts: listOfPosts
  });
});

// A single blog post
app.get('/blog/:post_id', function(req, res) {
  // Extract the id from the url entered
  var postId = req.params['post_id'];

  // Find the post
  var post = blogPosts[postId];

  // Show a 404 page if the post does not exist
  if (!post) {
    res.send('Not found');
  } else {
    // Render post.handlebars with the data it needs
    res.render('post', post);
  }
});

// Handle the contact form submission
app.post('/contact', function (request, response) {
  
  var formBody = {
    'name': request.body.name,
    'email': request.body.email,
    'subject': request.body.subject,
    'message': request.body.message
  }

  var missingName = (formBody.name === '');
  var missingEmail = (formBody.email === '');
  var missingMessage = (formBody.message === '');

  if(missingName || missingEmail || missingMessage) {
    response.render('contact',{
      error: true,
      message: 'Some fields are missing',
      formBody: formBody,
      missingName: missingName,
      missingEmail: missingEmail,
      missingMessage: missingMessage
    })
  } else {

    var emailOptions = {
      from: formBody.name + '<' + formBody.email + '>',
      to: 'luke@intelletec.com',
      subject: 'Website contact form - ' + formBody.subject,
      text: formBody.message
    }

    mailgun.messages().send(emailOptions, function (error, res) {
      console.log(res);
      if(error) {
        response.render('contact', {
          error: true,
          message: 'There was an error sending the message',
          formBody: request.body
        })
      } else {
        response.render('contact', {
          success: true,
          message: 'Your message has been successfully sent!'
        })
      }
    })
  }
});

// Start our server on port 5000
app.listen(5000, function () {
  console.log('Lesson 1 listening on port 5000!');
});
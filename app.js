const express = require('express');
const fs = require('fs');
const route = express.Router();
const path = require('path');
const multer = require('multer');
const app = express();


const p = path.join(__dirname, 'userDetails.json')
function read(cb) {

    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    })
}

function save(user, cb) {
    read(users => {
        users.push(user);
        fs.writeFileSync(p, JSON.stringify(users), cb(users))

    })
};


// Username and password of Admin

const username = 'Sukhpal';
const password = 'sukhpal100';


route.post('/', (req, res, next) => {

    if (req.body.name !== '' && req.body.email !== '' && req.body.pswd !== '') {
        isTrue = true;
        if (isTrue && req.body.pswd === req.body.pswd1) {
            const user =
            {
                id: Date.now(),
                name: req.body.name,
                email: req.body.email,
                Password: req.body.pswd
            }; 


            // Here we have read the user data which goes to json file 

            fs.readFile("userDetails.json", 'utf8', function (err, data) {
                var d = JSON.parse(data);
                var u = d.find(el => {
                    return el.email === req.body.email;
                })
                if (!u) {
                    save(user, users => {
                        console.log('Details Submitted')
                    });
                    return res.render('firstpage', {
                        msg: " User Registered Successfully!!"
                    })
                }
                else {
                    res.render('firstpage', {
                        msg: "This email id already exist"
                    })
                }
            })
        }
        else {
            isTrue = false;
            return res.render('firstpage', {
                msg: 'password do not match'
            })
        }
    }
    else {
        res.render('firstpage', {
            msg: 'Fields cannot be empty'
        });
    }
});



// This redirects us to the admin page

route.get('/admin', (req, res, next) => {
    res.render('admin');
})
route.post('/admin', (req, res, next) => {
    

    // console.log('inside')
    console.log(req.body.name)
    console.log(req.body.pswd)

    if (username === req.body.name && password === req.body.pswd) {
    
        isTrue = true;
        const user = { email: username, password: password }
        req.session.user = user;
        if (isTrue) {
            res.send('<script> setTimeout(() => { window.location.href="http://localhost:3000/details"; },100);</script>');
        } else {
            res.render('admin', {
                msg: 'Invalid details Provided'
            })
            isTrue = false;
        }
    }
});


// Providing a User Login with matching all the respective credentials

route.get('/userlogin', (req, res, next) => {
    res.render('userlogin');
})
route.post('/userlogin', (req, res, next) => {
    const email = req.body.username;
    const password = req.body.pswd;
    const user = { email: email, password: password }
    fs.readFile("userDetails.json", 'utf8', function (err, data) {
        var d = JSON.parse(data);
        // console.log(d);
        var u = d.find((el) => {
            return el.email == email;
        })
        console.log(email, u)
        if (u && u.email === email && u.Password === password) {
            req.session.user = user;
            return res.render('userlog', {
                msg: u
            })
        } else {
            return res.render('userlogin', {
                msg: "Invalid Username Or Password"
            })
        }
    })

});


// Uploading an image of the user


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null,file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file,cb);
    }
}).single('myImage');

// Check File Type
function checkFileType(file, cb) {
    // Allowed extension
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mine type
    const mimetype = filetypes.test(file.mimetype);


    if(mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!!');
    }
}

// Set up Templating engine

app.set('view engine', 'pug');


// Public folder
app.use(express.static('./public'));

app.get('/', (req,res) => res.render('index'));
  

app.post('/upload' , (req,res) => {
    upload(req,res, (err) => {
        if(err) {
            res.render('index', {
                msg: err
            });
        } else {
           
            if(req.file == undefined) {
                res.render('index', {
                    msg: 'Error: No File Selected.'
                });

            } else {
                res.render('index', {
                    msg: 'File Uploaded',
                    file: `uploads/$(req.file.filename)`
                });
            }
        }
    });
});



// Getting a Particular user Details


route.get('/details/:id', (req, res, next) => {
    if (!req.session.user) {
        // console.log('first')
        return res.redirect('/')
    }
    next()
}, function (req, res) {


    fs.readFile("userDetails.json", 'utf8', function (err, data) {
        var d = JSON.parse(data);

        var u = d.find((el) => {
            return el.id == req.params.id;
        })

        res.render('details', {
            msg: u
        })

    });
})






route.get('/details', (req, res, next) => {
    if (!req.session.user) {
    
        return res.redirect('/')
    }
    next()
}, function (req, res) {
  
    read(users => {
        res.render('users', { users: users })
    })
})



// Deleting a particular user 

route.get('/delete/:userId', (req, res, next) => {
    if (!req.session.user) {
        console.log('first')
        return res.redirect('/')
    }
    next()
}, (req, res, next) => {
    // console.log("insid delete by id")
    const userId = req.params.userId;
    console.log(userId);
    read(users => {
        const AllUsers = [...users];
        updatedUsers = AllUsers.filter(user => {
            return user.id.toString() !== userId.toString();
        });
        fs.writeFileSync(p, JSON.stringify(updatedUsers))
    

    })

    res.send('<script> setTimeout(() => { window.location.href="http://localhost:3000/details";}, 1000);</script>');
});




route.get('/edit/:userId', (req, res, next) => {
    if (!req.session.user) {
        
        return res.redirect('/')
    }
    next()
}, (req, res, next) => {
    
    const userId = req.params.userId;
    fs.readFile("userDetails.json", 'utf8', function (err, data) {
        var d = JSON.parse(data);
        var u = d.find((el) => {
            return el.id == userId;
        })
        res.render('edit', {
            msg: u
        })

    });
})




// Editing a particular user Details

route.post('/editdetail', (req, res, next) => {
    if (!req.session.user) {
        
        return res.redirect('/')
    }
    next()
}, (req, res, next) => {
    if (req.body.pswd === req.body.pswd1) {
        const data = {
            name: req.body.name,
            id: req.body.userId,
            email: req.body.email,
            Password: req.body.pswd
        }
        read(users => {
            const updatedUsers = [...users]
            const userIndex = updatedUsers.findIndex(user => {
                return user.id.toString() === data.id.toString();
            })
            const userToUpdate = updatedUsers[userIndex];
            userToUpdate.name = data.name
            userToUpdate.email = data.email
            userToUpdate.Password = data.Password
            updatedUsers[userIndex] = userToUpdate
            
            fs.writeFileSync(p, JSON.stringify(updatedUsers))
        })
        res.send('<script> setTimeout(() => { window.location.href="http://localhost:3000/details";}, 200);</script>');
    } else {
        res.render('firstpage', {
            msg: 'User Details Not Updated'
        })
    }
});

route.post('/logout', (req, res) => {
    req.session.destroy(err => {
        console.log('User Logged Out');
    });
    res.redirect('/');
})
module.exports = route;

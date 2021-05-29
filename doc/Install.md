# Install

You will need to install the following, if you do not already have them.

1. Git: On windows go to https://git-scm.com/download/win and install it. If you are on a Mac, install brew first, https://brew.sh/ and then `brew install git`
2. Node.js: https://nodejs.org/en/download/
3. Heroku: https://devcenter.heroku.com/articles/heroku-cli
4. I use visual studio code, but you can use another environment, but you will need to be able to run git-bash terminal windows in your environment.
   https://code.visualstudio.com/

## Setup

On your browser go to your github account and login

If you have just installed VSC you need to setup the bash shell. Use Control-Shift-P
In the input field type "Select Default Shell"
Choose "Git Bash"

Then open a git-bash shell - on VSC use Control-\`

    mkdir enciv
    cd enciv
    git clone https://github.com/EnCiv/undebate
    cd undebate
    npm install

Note - if you are using multiple accounts with heroku, make sure that on your browser you are logged into the account that you want to use.

Heroku calls them 'apps' but think of it as a server instance in the cloud with a URL, the name you give it is part of the url. Create one with:

    heroku create undebate-something-unique

Then we add the MongoDB database. It's also in cloud. You will be able to use this one database when you are running locally, and when you are running in the cloud. Follow the instructions in this slide show:
https://docs.google.com/presentation/d/10fEk_OdfN-dYh9PlqG6nTFlu4ENvis_owdHbqWYDpBI/present?slide=id.gb4a0dbf10b_0_93

Now lets get the environment variable with the URI for that database and store it in your bash configuration file so you can use it when you run locally. This string has a password in it and it should never be shared or commited to a repo. The .gitignore file ignores .bashrc so it won't get added into a repo - just make sure it stays that way.

```
    echo 'export MONGODB_URI="mongodb+srv://any-name-you-want:Znkx8UyAZAV15xRK@cluster0.xtpzi.mongodb.net/anydbname?retryWrites=true&w=majority"' >> .bashrc
```

Now lets add the MONGODB_URI to the heroku server:

```
    heroku config:set MONGODB_URI="mongodb+srv://any-name-you-want:Znkx8UyAZAV15xRK@cluster0.xtpzi.mongodb.net/anydbname?retryWrites=true&w=majority"
```

Now we just tell node we are in development mode locally, but on heroku we set it to production. There are a few optimizations that are applied in production, and it's important to check to make sure it works that way.

    echo "export NODE_ENV=development" >> .bashrc
    heroku config:set NODE_ENV=production

Then to get all these environment variable set in your current instance of bash do this. But you won't have to it the next time you start up.

    source .bashrc

Now you should be able to run it.

    npm run dev

You should now be able to browser to localhost:3011/candidate-conversation and see an undebate. The server is running locally on our machine. It's using webpack, which is really neat bacuase when you save changes to the source code, it will automatically be compliled and applied to the server and to the application in your browser. You may still have to refresh your browser page though.

You can use Control-C to terminate the server

To run this in the cloud on heroku:

    git push heroku HEAD:master

Then you will be able to browse to `https://undebate-[something unique].herokuapp.com/candidate-conversation` and see the same thing.

Then, to record your own part in the candidate conversation browser to: localhost:3011/candidateboard-conversation-candidate-recorder or `https://undebate-something-unique.herokuapp.com/schoolboard-conversation-candidate-recorder`

There are other urls that you can check out in your development environment. To see the latest list do this:

```
cat iota.json | grep path
```

Here is the list as of the time of this writing:

```
    "path": "/join",
```

Just take the url part, like "what-is-democracy" and add either localhost:3011 or https://undebate-[something unique].herokuapp.com at the beginning and you will be able to check it out.

# Prettier

This project is now using prettier. This makes some spacing and the user of quotes and a few other things consistent across the project.

## To get prettier in Visual Studio Code

1. Open VSC for this project
2. Hit Control-P
3. In the search box paste in this text: `ext install esbenp.prettier-vscode`
4. Go to [File][preferences][Settings] where you will see a search box followed by a list of settings.
5. Search for `editor format on save`
6. Click on `workspace` just below the search bar - so that this setting only applies to this work space
7. Check the box for `Editor: Format On Save`

If you are not using VSC prettier will also be run before you commit, but see if prettier is available for your editor and post instuctions here

## EMAIL Setup

Setting up email from the server is not required, and is kind of hard. For information on how to do it for g-suite see https://medium.com/@imre_7961/nodemailer-with-g-suite-oauth2-4c86049f778a
If you do, edit the .bashrc file and add these lines

    export NODEMAILER_SERVICE="gmail"
    NODEMAILER_USER="no-reply@yourdomain.com"
    NODEMAILER_SERVICE_CLIENT="XXXXXXXXXXXXXXXXXXXXX"
    NODEMAILER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX........XXXXX\n-----END PRIVATE KEY-----\n

If you use Zoho, you can do it like this.

    export NODEMAILER_SERVICE="Zoho"
    NODEMAILER_USER="no-reply@yourdomain.com"
    NODEMAILER_PASS="xxxxxxxxx"

If you use some other service, or 'things change' as they always do, go to app/server/util/send-mail.js and address them, but don't break the above configurations
After you make changes to the .bashrc file you will need to heroku config:set them to get them to heroku

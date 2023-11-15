# Ski-Power-API

RUN THE API:

1. **npm install** in the terminal in the project folder in VS Code. (This only needs to be done once or when a new library has been added to the package.json file)
2. To run the API: **npm run devstart**

RUN MONGODB DATABASE:

You will need to install the mongodb community edition on your local device. https://docs.mongodb.com/manual/administration/install-community/

How I run on my local device:
1. I create a new directory "Databases" using the **mkdir Databases** command in command line/terminal. (Note this folder can be anywhere you want)
2. After making the new directory, go into it: **cd Databases**.
3. Make a new Directory for the Ski Power project: **mkdir SkiPower**. This is where all the data will be saved. This is a completely separate folder and there should be no other project in here. This will act as your database.
4. Run Mongodb database: **mongod --dbpath SkiPower** ... This will run the database. Check the Ski Power API terminal to see if it connected.

**If the above does not work. Then try to follow the steps to run mongodb locally on your machine in the mongodb documentation.**

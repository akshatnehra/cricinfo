// Extract information of 2019 World Cup
// Store it in Excel and PDF
// Purpose -> to learn how to extract information 
           // Get exp with jS


// MODULES USED: minimist, axios, jsdom, excel4node, pdf-lib

// Run following command in order to install all these modules
// npm init -y
// npm install minimist         (taking input in terminal)
// npm install axios            (request the HTML)
// npm install jsdom            (extracting data from HTML)
// npm install excel4node       (Insert data in EXCEL file)
// npm install pdf-lib          (Insert data in PDF file)


// node cricinfoExtractor.js --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results --excel=WorldCup.csv --dataFolder=data

// Requiring All the modules

let fs = require("fs");
let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");
const { table } = require("console");

// Extracting  input given in the terminal using minimist
let args = minimist(process.argv);
// console.log(args.source);
// console.log(args.excel);
// console.log(args.dataFolder);


// Download using axios
let responsePromise = axios.get(args.source);
responsePromise.then(function(response){
    let html = response.data;

    // read using jsdom
    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    
    let matchInfoDivs = document.querySelectorAll(".ds-px-4.ds-py-3 .ds-text-compact-xxs");
    // To check if 48 matches div's selected
    // console.log(matchInfoDivs.length);

    // Extract information of all the matches and store it
    // Individually iterating over all the matches one by one
    let matches = [];
    for(let i=0; i<matchInfoDivs.length; i++){
        let match = {

        };

        // Selecting and storing teams of a match
        let teams = matchInfoDivs[i].querySelectorAll(".ci-team-score p");
        match.team1 = teams[0].textContent;
        match.team2 = teams[1].textContent;

        // Selecting and storing scores of both the teams 
        // let scores = matchInfoDivs[i].querySelectorAll(".ci-team-score div strong");
        // match.team1Score = scores[0].textContent;
        // match.team2Score = scores[1].textContent;

        function processThis(scores, callback) {
            
        }
        
        // ERROR was encountered!!!
        // Due to async behaviour scores[0].textContent was unable to access value
        // Used Callback to resolve this issue :)
        let scores;
        processThis(scores = matchInfoDivs[i].querySelectorAll(".ci-team-score div strong"), function callFunction() {
            match.team1Score = scores[0].textContent;
            match.team2Score = scores[1].textContent;
        });


        // Selecting and storing result 
        let result = matchInfoDivs[i].querySelectorAll("div>p>span");  
        match.result = result[0].textContent;    
        
        // Storing the object of a match into an array
        matches.push(match);
    }

    console.table(matches);

}).catch(function(error){
    console.log(error);
});

// Make excel using excel4node
// make pdf using pdf-lib

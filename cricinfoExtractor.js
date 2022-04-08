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
const { match } = require("assert");

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
        let scores = matchInfoDivs[i].querySelectorAll(".ci-team-score div strong");
        match.team1Score = "";
        match.team2Score = "";

        // ERROR was encountered!!!
        // there are few teams who's scores were blank and we were trying to access them 
        // SOLUTION => First check if exists, then access and assign
        if(scores.length == 2){
            match.team1Score += scores[0].textContent;
            match.team2Score += scores[1].textContent;
        }
        else if(scores.length == 1){
            match.team1Score += scores[0].textContent;
        }



        // Selecting and storing result 
        let result = matchInfoDivs[i].querySelectorAll("div>p>span");  
        match.result = result[0].textContent;    
        
        // Storing the object of a match into an array
        matches.push(match);
    }

    // Checking if we got the desired data
    // console.table(matches);

    let matchJSON = JSON.stringify(matches);
    fs.writeFileSync("matchJSON", matchJSON, "utf-8");


    // Adding all the teams once
    let teams = [];
    for(let i=0; i < matches.length; i++){
        addTeamIfNotAdded(teams, matches[i].team1);
        addTeamIfNotAdded(teams, matches[i].team2);
    }

    // Adding match details of all the teams as we need the data teamwise and not matchwise
    for(let i=0; i < matches.length; i++){
        addMatchToTeam(teams, matches[i].team1, matches[i].team2, matches[i].team1Score, matches[i].team2Score, matches[i].result);
        addMatchToTeam(teams, matches[i].team2, matches[i].team1, matches[i].team2Score, matches[i].team1Score, matches[i].result);
    }

    let teamsJSON = JSON.stringify(teams);
    fs.writeFileSync("teamsJSON", teamsJSON, "utf-8");

    makeExcelFile(teams, args.excel);


}).catch(function(error){
    console.log(error);
});

function makeExcelFile(teams, excelFileName){
    let wb = new excel4node.Workbook();

    for (let i = 0; i < teams.length; i++) {
        let tsheet = wb.addWorksheet(teams[i].name);

        tsheet.cell(1,1).string("VS");
        tsheet.cell(1,2).string("Self Score");
        tsheet.cell(1,3).string("Opponent Score");
        tsheet.cell(1,4).string("Result");

        for (let j = 0; j < teams[i].matches.length; j++) {
            
            tsheet.cell(2+j,1).string(teams[i].matches[j].vs);
            tsheet.cell(2+j,2).string(teams[i].matches[j].selfScore);
            tsheet.cell(2+j,3).string(teams[i].matches[j].oppScore);
            tsheet.cell(2+j,4).string(teams[i].matches[j].result);
            
        }
        
    }

    wb.write(excelFileName);
}

function addMatchToTeam(teams, homeTeam, oppTeam, homeScore, oppScore, result){
    let idx = -1;
    for(let i = 0; i < teams.length; i++){
        if(teams[i].name == homeTeam){
            idx = i;
            break;
        }
    }

    let team = teams[idx];
    team.matches.push({
        vs: oppTeam,
        selfScore: homeScore,
        oppScore: oppScore,
        result: result
    });
}

function addTeamIfNotAdded(teams, teamName){
    let flag = -1;
    for(let i = 0; i < teams.length; i++){
        if(teams[i].name == teamName){
            flag = 1;
            break;
        }
    }

    if(flag == -1){
        let team = {
            name: teamName,
            matches: []
        };
        teams.push(team);
    }


}

// Make excel using excel4node
// make pdf using pdf-lib

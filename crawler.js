
var fs = require('fs');
var gplay = require('google-play-scraper');
var appFile = 'D:/ActiveCrawlers/rawdata/appList.txt';
var directory = 'D:/ActiveCrawlers/rawdata/';
var repliesDirectory = 'replies/';
var urlDirectory = 'url/';
var reviewDirectory = 'review/';
var logFile = 'D:/ActiveCrawlers/crawlerLog.txt';
var counter = 0;
var idStore ={};

readAppListAndCrawl();

function crawlReviews(idSTR){
	console.log("Crawling for " + idSTR);
	gplay.reviews({
		appId: idSTR,
		page: 0,
		sort: gplay.sort.NEWEST
	}).then(function(results) {
		return new Promise(function(resolve, reject) {
			parseResults(results, idSTR);
		});
	}).then(function(results) {
       console.log("results here: " + results)
	}).catch(function(err) {
       console.log("error here: " + err);
	});
}
function parseResults(results, idSTR){
	for(i = 0; i < results.length ; i++){
		if(!(results[i].id in idStore)){
			console.log(i);
			idStore[results[i].id] = true;
			var meta = "\""+counter + ".txt\",\""+results[i].id+"\",\""+results[i].score+"\",\""+results[i].date+"\",\""+results[i].userName+"\"\n";
			fs.appendFile(directory+idSTR+'/metadata.txt', meta, function(err) {if (err) fs.appendFile(logFile, err);})
			fs.writeFile(directory+idSTR+'/'+reviewDirectory +counter+'.txt', results[i].text, function(err) {if (err) fs.appendFile(logFile, err);})
			
			fs.writeFile(directory+idSTR+'/'+urlDirectory +counter+'.txt', results[i].url, function(err) {if (err) fs.appendFile(logFile, err);})
			if (typeof results[i].replyDate !== "undefined"){
				fs.writeFile(directory+idSTR+'/'+repliesDirectory +counter+'.txt', "\""+results[i].replyText + "\",\"" +results[i].replyText+"\"", function(err) {if (err) fs.appendFile(logFile, err);})
			}	
			counter++;
		}		
	}
	
		//setTimeout(crawlReviews,10000);
}

function readAppListAndCrawl(){
	console.log("Reading for app list in file");
	var instream = require('fs').createReadStream(appFile);
	var lineReader = require('readline').createInterface({
		input: instream
	});
	instream.on('end', () => {setTimeout(readAppListAndCrawl,10000); });
	lineReader.on('line', function (line) {
	  var appID = line;
	  ensureExists(directory+appID, 0744, function(err) {
			if (err) fs.appendFile(logFile, err);// handle folder creation error
		});
	  ensureExists(directory+appID+'/'+reviewDirectory, 0744, function(err) {
			if (err) fs.appendFile(logFile, err);// handle folder creation error
		});
	  ensureExists(directory+appID+'/'+urlDirectory, 0744, function(err) {
			if (err) fs.appendFile(logFile, err);// handle folder creation error
		});
	  ensureExists(directory+appID+'/'+repliesDirectory, 0744, function(err) {
			if (err) fs.appendFile(logFile, err);// handle folder creation error
		});
		crawlReviews(appID);
	});

}

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}
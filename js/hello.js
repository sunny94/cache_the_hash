
//prefixes of implementation that we want to test
 window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 
 //prefixes of window.IDB objects
 window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
 window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
 
 if (!window.indexedDB) {
	window.alert("Your browser doesn't support a stable version of IndexedDB.")
 }

 
var currentOnCB;
 const cacheData = [
	{keyName: "name", valueName: "sunny"}];
 var db;
 var request = window.indexedDB.open("myNewDatabase3", 1);
 
 request.onerror = function(event) {
	console.log("error: ");
 };
 
 request.onsuccess = function(event) {
	db = request.result;
	console.log("success: "+ db);
	setupAutoComplete();
 };
 
 request.onupgradeneeded = function(event) {
	
	console.log("running onupgradedneeded");
	var db = event.target.result;

	if(!db.objectStoreNames.contains("cacher")){
		console.log("I need to make the browser objectstore");
		var objectStore = db.createObjectStore("cacher", {keyPath: "keyName"});
		objectStore.createIndex("searchkey", "searchkey", {unique: false});
		for (var i in cacheData) {
			cacheData[i].searchkey = cacheData[i].keyName.toLowerCase();
	   		objectStore.add(cacheData[i]);
		}
	}
}
 
/*
function read() {
	var keyName = document.getElementById("search").value
	var transaction = db.transaction(["cacher"]);
	var objectStore = transaction.objectStore("cacher");
	var request = objectStore.get(keyName);
	var dfd = jQuery.Deferred();
	var returnValue;
	
	request.onerror = function(event){
			returnValue =  "Some error occurred try again";
//			$("#searchBtn")[0].setAttribute("data-clipboard-text", returnValue)
			document.getElementById("result").innerHTML = "Error :(";
			dfd.resolve(returnValue);
		}

	request.onsuccess = function(event){
		if(request.result) {
			returnValue = request.result.valueName;
			document.getElementById("result").innerHTML = "Copied :)";
		}	
		else {
			returnValue = "Key does not exist in db";
		}
		dfd.resolve(returnValue);
//		$("#searchBtn")[0].setAttribute("data-clipboard-text", returnValue)
	}	

	return dfd.promise();	
}
*/ 

 function readAll() {
	var objectStore = db.transaction("cacher").objectStore("cacher");
	
	objectStore.openCursor().onsuccess = function(event) {
	   var cursor = event.target.result;
	   
	   if (cursor) {
		  alert("KeyName is" + cursor.value.keyName + ", Value: " + cursor.value.valueName);
		  cursor.continue();
	   }
	   
	   else {
		  alert("No more entries!");
	   }
	};
 }
 
function add() {
	var keyName = document.getElementById("keyName").value
	var valueName = document.getElementById("valueName").value

	var request = db.transaction(["cacher"], "readwrite")
	.objectStore("cacher", {keyPath: "keyName"})
	.add({ keyName: keyName, valueName: valueName, searchkey: keyName.toLowerCase()});
	
	request.onsuccess = function(event) {
	   $("#keyName").val("");
	   $("#valueName").val("");		
	   $("#result").innerHTML = "Pair added :)";
	};
	
	request.onerror = function(event) {
	   $("#result").innerHTML = "Not able to add :(";
	}
 }
 
function remove() {
	var removeKey = document.getElementById("remove").value
	var request = db.transaction(["cacher"], "readwrite")
	.objectStore("cacher", {keyPath: "keyName"})
	.delete(removeKey);
	
	request.onsuccess = function(event) {
	   $("#result").innerHTML = "Pair removed!!!!";
	};
 }


document.getElementById("readAllBtn").addEventListener("click", readAll);	   

/*document.getElementById("searchBtn").onclick = function(){
	$.when(read()).then(
		function(returnValue){
			window.returnValue = returnValue;
			document.execCommand('copy');
	});
};
*/

//$("input").addEventListener("onfocus", emptyFooter);
document.addEventListener("copy", function(e){
	e.clipboardData.setData("text/plain", window.currentOnCB);
	e.preventDefault();
	$("#search").val("");
	$("#result").innerHTML = "Copied :)";
});	 
 
document.getElementById("addBtn").addEventListener("click", add);	   
document.getElementById("removeBtn").addEventListener("click", remove);	   

function emptyFooter(){
	$("#result").innerHTML = " ";
};


function setupAutoComplete() {

  //Create the autocomplete
  $("#search").autocomplete({
    source: function(request, response) {

      console.log("Going to look for "+request.term);
 
//      $("#displayEmployee").hide();

      var transaction = db.transaction(["cacher"], "readonly");
      var result = [];

      transaction.oncomplete = function(event) {
        response(result);
      };

      // TODO: Handle the error and return to it jQuery UI
      var objectStore = transaction.objectStore("cacher");

      // Credit: http://stackoverflow.com/a/8961462/52160
      var range = IDBKeyRange.bound(request.term.toLowerCase(), request.term.toLowerCase() + "z");
      var index = objectStore.index("searchkey");

      index.openCursor(range).onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
          result.push({
            value: cursor.value.keyName + ": " + cursor.value.valueName,
            person: cursor.value
          });
          cursor.continue();
        }
      };
      
	  return result;
	},
  	select: function(event, ui){
		$("#search").val(ui.item.person.keyName);
		window.currentOnCB = ui.item.person.valueName;
		document.execCommand('copy');
	},
	open: function(event, ui) {
            $(".ui-autocomplete").css("z-index", 1000);
        }
  });

}	


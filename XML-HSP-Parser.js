var parsers = []

var postParse = function(){throw("Unconfigured postParse Error")};

jQuery(function(){
  jQuery('#read-file-btn').click(function(){
  var file_input = jQuery('#file_select_in')[0].files[0];
  var queryMode = {};
  if(jQuery('#query_number').length !== 0){
   var q_num = parseInt(jQuery('#query_number')[0].value);
   if (isNaN(q_num)){
    queryMode.start = 0;
    queryMode.end = 5
   } else { 
    queryMode.start = q_num -1
    queryMode.end = q_num;
   }
  } else {
   queryMode.start = 0
   queryMode.end = 5
  }
  console.log(file_input);
  var parser = new XMLHSPParser(file_input.name, queryMode);
  console.log(parser);
  parsers.push(parser);
  var reader = new FileReader();
  var parseXML = function(evt){ parser.parseXML(evt); }
  reader.onerror = function(e){ alert("An error occurred", e) };
  reader.readAsText(file_input, 'UTF-8');
  reader.onload = parseXML;
 });
})

/*
 HitData represents a single Blast Hit, with one or more Hsps. 
*/
var HitData = function(handle, index, fileName){
 this.handle = handle;
 this.name = handle.find('Hit_def').text()
 this.maxHit = 0;
 this.minHit = Infinity;
 this.maxQuery = 0;
 this.minQuery = Infinity;
 this.hspsHandle = handle.find("Hsp");
 this.index = index;
 this.fileName = fileName;
 var self = this;
 this.hspsData = this.hspsHandle.map(function(value, index){
  var hsp = new HspData(jQuery(this), self);
  return hsp;
 });
}

/*
 HspData represents a single Hsp 
*/
var HspData = function(handle, hit){
 this.handle     = handle;
 this.hitFrom    = parseInt(handle.find('Hsp_hit-from').text()); 
 this.hitTo      = parseInt(handle.find('Hsp_hit-to').text()); 
 this.hitFrame   = handle.find('Hsp_hit-frame').text();
 this.queryFrom  = parseInt(handle.find('Hsp_query-from').text()); 
 this.queryTo    = parseInt(handle.find('Hsp_query-to').text()); 
 this.queryFrame = handle.find('Hsp_query-frame').text();
 //Compute relative values
 if(this.hitFrom > this.hitTo){
  this.upperHit = this.hitFrom;
  this.lowerHit = this.hitTo;
 } else {
  this.upperHit = this.hitTo;
  this.lowerHit = this.hitFrom;
 }
 if(this.queryFrom > this.queryTo){
  this.upperQuery = this.queryFrom;
  this.lowerQuery = this.queryTo;
 } else {
  this.upperQuery = this.queryTo;
  this.lowerQuery = this.queryFrom;
 }
 this.hit        = hit
 this.hit.maxHit = this.hit.maxHit < this.upperHit ? this.upperHit : this.hit.maxHit;
 this.hit.maxQuery = this.hit.maxQuery < this.upperQuery ? this.upperQuery : this.hit.maxQuery;
 this.hit.minHit = this.hit.minHit > this.lowerHit ? this.lowerHit : this.hit.minHit;
 this.hit.minQuery = this.hit.minQuery > this.lowerQuery ? this.lowerQuery : this.hit.minQuery;
}

/*
 XMLHSPParser represents the parser and the data extraction process. Designed for 
 handling BLASTN results
*/
var XMLHSPParser = function(name, queryMode){
 //A handle for access the XML Document
 this.$xmlHandle = undefined;
 
 this.fileName = name;
 
 //A collection of HitData
 this.hitDataSet = [];
 
 this.queryMode = queryMode
 
 this.parseXML = function(evt){
  this.$xmlHandle = jQuery(jQuery.parseXML(evt.target.result));
  this.hitDataSet = this.$xmlHandle.find('Hit').slice(queryMode.start,queryMode.stop);
  var file = this.fileName;
  console.log(file);
  this.hitDataSet = this.hitDataSet.map(function(index, value){
    return new HitData(jQuery(this), index, file);
   });
  postParse(this.hitDataSet);
  console.log("Parse Complete");
 };
}

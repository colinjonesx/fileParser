/**
 * This is where one of a number of log files could be parsed
 * if only the file pointers were allowed to be passed to the
 * worker threads :(
 */

function parseTimestamp(dtString){
  dtString = dtString.substring(0,dtString.indexOf('['));
  //console.log(dtString);
  var year = dtString.substr(0, 4),
      mon = dtString.substr(4, 2),
      day = dtString.substr(6, 2),
      hr = dtString.substr(8, 2),
      min = dtString.substr(10, 2),
      sec = dtString.substr(12, 2),
      ms = dtString.substr(15),
      result =Date.parse( mon+'/'+day+'/'+year) + hr*3600000+min*60000+sec*1000+ms*1;
  return (result)?result:0;
}

function blisteParse(lines){
  var results = {
    startParse : (new Date()).getTime(),
    lineCount : lines.length
	
  },
      storeCount = 0,
      storeEvents = [],
      tillCount = 0,
      tillEvents = [],
      sentCount = 0,
      sentEvents = [],
      respEvents = [];
  
  for(var i = 0; i < lines.length; i++){
    var line = lines[i],//$.trim(lines[i]),
        bits = line.split(' '),
        logStamp = parseTimestamp(bits.shift());
    if(line.indexOf('commencing trading') !== -1){
      //storeEvents.push([logStamp, ++storeCount]);
	  storeEvents.push([logStamp, 1]);
    }else if(line.indexOf('ceasing trading') !== -1){
      //storeEvents.push([logStamp, --storeCount]);
	  storeEvents.push([logStamp, -1]);
    }else if(line.indexOf('coming online') !== -1){
      //tillEvents.push([logStamp, ++tillCount]);
	  tillEvents.push([logStamp, 1]);
    }else if(line.indexOf('going offline') !== -1){
      //tillEvents.push([logStamp, --tillCount]);
	  tillEvents.push([logStamp, -1]);
    }else if(line.indexOf('SendingMsg:') !== -1){
      //sentEvents.push([logStamp, ++sentCount]);
	  sentEvents.push([logStamp, 1]);
    }else if(line.indexOf('[PERFPASS]') !== -1){
      respEvents.push([logStamp, bits[0].substr(bits[0].lastIndexOf(';')+1)]);
    }
  }
  results.storeEvents = storeEvents;
  results.tillEvents = tillEvents;
  results.sentEvents = sentEvents;
  results.respEvents = respEvents;
  results.endParse = (new Date()).getTime();
  return results;
}
 


self.onmessage = function(e){
  switch(e.data.cmd){
    case 'process':
      self.postMessage('starting process');
      
	  var fileContent = e.data.param.data,
	      start = (new Date()).getTime(),
		  result = blisteParse(fileContent.split('\n')),
		  duration = (new Date()).getTime() - start,
		  pause = (new Date()).getTime() - e.data.param.start;
	      
	  
		self.postMessage({
		  success:true,
		  cxtId:e.data.param.cxtId,
          data:' completeParse, pause:'+pause+', duration:'+duration
		});
	  break;
  }
  self.postMessage('finished process');
};
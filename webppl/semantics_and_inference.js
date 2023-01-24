var makeBlockWorld = editor.get("model");

///////////////////
//// Semantics ////
///////////////////

var red = function(obj) {
  return obj.color == 'red';
}

var yellow = function(obj) {
  return obj.color == 'yellow';
}

var tall = function(obj) {
  return obj.y < 160;
}

var onGround = function(obj) {
  return obj.y > 400;
}

/////////////////////////////////////
//// Visualization and inference ////
/////////////////////////////////////

var visualizeConds = function(world) {
//   condition(filter(red, world).length < 2);
    condition(world.length < 6);
//   condition(filter(yellow, world).length > 20);
//   condition(any(tall, world));
  var finalWorld = physics.run(1, world);
//   return finalWorld[0].velocity[0] > 0;
//   return filter(red, finalWorld).length;
  return finalWorld;
}

var w = Infer({method: 'rejection', samples: 1},
            function() { return visualizeConds(makeBlockWorld()) });
var theWorld = w.toString().slice(14, -4);
console.log(theWorld);
physics.animate(1, JSON.parse(theWorld));

var run = function(world) {
//   condition(filter(red, world).length >= 1);
//   condition(any(tall, world));
  var finalWorld = physics.run(1000, world);
//   return finalWorld[0].velocity[0] > 0;
//   return filter(red, finalWorld).length;
  var objectsOnGround = filter(onGround, finalWorld);
  var numYellow = filter(yellow, objectsOnGround).length
  var numRed = filter(red, objectsOnGround).length
  return numYellow > numRed? 2 : numYellow == numRed? 1 : 0
}

// viz(Infer({method: 'forward', samples: 100},
//            function() { return run(makeBlockWorld()) }))


var result = function () {
  var d = Infer({method: 'forward', samples: 50},
            function() { return run(makeBlockWorld()) });
  var moreRedProb = Math.exp(d.score(0));
  var moreYellowProb = Math.exp(d.score(2));
  var likert = Math.round((moreYellowProb / (moreRedProb + moreYellowProb)) * 6) + 1;
  return likert;
}

// viz(Infer({method: 'forward', samples: 20}, result));

// Simulating and animating the world
// physics.animate(1, makeBlockWorld());
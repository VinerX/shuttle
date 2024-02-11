var editor = ace.edit("userFunction");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

window.onload = function() {
  resetFunction();
};

function resetFunction() {
  editor.setValue(`function myFunction() {
  let acceleration = 0;
  let rotation = 0;
  //Your code here
  return [acceleration, rotation];
}`);
}

function runFunction() {
  var userCode = editor.getValue();
    var userFunc;
  
    try {
      userFunc = new Function(`return ${userCode}`)();
    } catch (error) {
      document.getElementById("result").innerHTML = "Compilation Error: " + error.message;
      return;
    }
  
    if (typeof userFunc !== "function") {
      document.getElementById("result").innerHTML = "Error: Input is not a function.";
      return;
    }
  
    var result;
    try {
      result = userFunc();
    } catch (error) {
      document.getElementById("result").innerHTML = "Execution Error: " + error.message;
      return;
    }
  
    if (!Array.isArray(result) || result.length !== 2) {
      document.getElementById("result").innerHTML = "Error: Function must return an array with two numbers.";
      return;
    }
    var a = result[0];
    var b = result[1];
  
    if (typeof a !== 'number' || a < 0 || a > 10) {
      document.getElementById("result").innerHTML = "Error: The first item must be a number between 0 and 10.";
      return;
    }
  
    if (typeof b !== 'number' || b < -90 || b > 90) {
      document.getElementById("result").innerHTML = "Error: The second item must be between -90 and 90.";
      return;
    }
    acceleration = result[0];
    angle = result[1];
    shuttle.x = defaultX;
    shuttle.y = defaultY;
    speed.x = 0;
    speed.y = 0;
    document.getElementById("result").innerHTML = "Function executed successfully. Result: " + result;
  }





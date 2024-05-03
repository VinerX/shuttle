var editor = ace.edit("userFunction");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

window.onload = function() {
  resetFunction();
};

//Кнопка сброса
function resetFunction() {
  editor.setValue(`function myFunction() {
  let fuelUsage = 0;
  let angle = 0;
  //Your code here
  return [fuelUsage, angle];
}`);
}

//Кнопка запуска миссии
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
    fuelUsage = result[0];
    angle = result[1];
    //shuttle.x = defaultX;
    //shuttle.y = defaultY;
    //speed.x = 0;
    //speed.y = 0;
    land = startMissions(shuttle);
    document.getElementById("result").innerHTML = "Function executed successfully. Result: " + result;
  }



  


  // Dmitry Code

  //app.renderer.height 1600
  //app.renderer.width для соотношения 1600 


  function startMissions(shuttle){
    let Graf = new PIXI.Graphics();
    app.stage.addChild(Graf);
    // Обозначение поверхности ровно под марсоходом
    let indicator = new PIXI.Graphics();
    app.stage.addChild(indicator);
    //app.stage.addChild(indicator);

    let y; // Позиция y ПОД марсоходом
    let land; // Совокупность линий

    
    

    //Переворачивает y (Изначально он равен 0 вверху)
    function rY(y){
      return app.renderer.height-y
    }

    //Обычный класс точки с x,y
    class Point{
      x;
      y;
      constructor(x,y) {
        this.x=x;
        this.y=rY(y);
      } 
      
    }

    // Создает точку по проценту от размера области
    function percentPoint(x,y){
      p = new Point(x,y);
      p.x= Math.floor(app.renderer.width*x);
      p.y= Math.floor(app.renderer.height-app.renderer.height*y);
      return p;
    } 

    // Создает левел из процентных точек (Более универсально)
    function levelFromPercentCoords(coords){
      level=[];
      coords.forEach(p => {
        level.push( new percentPoint(p[0],p[1]));
      });
      return level;
    }
    
    // Отвечает за линии земли и коллизию с ними
    class Land{
      //static firstLevelLand = levelFromPercentCoords( [[0,0],[0.1,0.4],[0.2,0.2],[0.3,0.7],[0.5,0.7]]);
      
      level = Mission.Missions[0].level;
      // level = Land.firstLevelLand;//[new Point(55,50), percentPoint(0.5,0.5),percentPoint(0.6,0.2)];
      //console.error("11");
      points = level.concat( [new Point(app.renderer.width,0)] );
      
      // Ищу Y, который скорее всего не задан точкой.
      findPointY(x){
        // Поиск ближайших точек
        let nearLeft = this.points.at(0);
        let nearRight = this.points.at(-1);
        this.points.forEach(p => {
          if (p.x<x){
            if (p.x>=nearLeft.x){
              nearLeft = p;
            }
          }
          else{
            if (p.x<=nearRight.x){
              nearRight = p;
            }
          }
        });

        let y;
        //Плато
        if (nearRight.y==nearLeft.y){
          y = rY(nearLeft.y)
        }
        else {
          //Спуск
          if (nearLeft.y<=nearRight.y){
            y = ( rY(nearLeft.y)-rY(nearRight.y) ) * Math.abs(nearRight.x-x) / Math.abs(nearRight.x-nearLeft.x)+rY(nearRight.y);
          }
          //подъем
          else{
            y = ( rY(nearRight.y)-rY(nearLeft.y) ) * Math.abs(nearLeft.x-x) / Math.abs(nearLeft.x-nearRight.x)+rY(nearLeft.y);
          }
        }
        return rY(y);
      }

      findPlateau(x){
        // Поиск ближайших точек
        let nearLeft = this.points.at(0);
        let nearRight = this.points.at(-1);
        this.points.forEach(p => {
          if (p.x<x){
            if (p.x>=nearLeft.x){
              nearLeft = p;
            }
          }
          else{
            if (p.x<=nearRight.x){
              nearRight = p;
            }
          }
        });  
        // Это плато
        if(nearRight.y==nearLeft.y) {
          return 1 
        }
        // Есть уклон
        else{
          return 0
        }     
      }
      // тру если норм, false если краш  --- Нужно добавить условия успешной посадки
      hasColision(shuttle){
        y = rY(this.findPointY(shuttle.x));
        update();
        if ( y-1>rY(shuttle.y)){

            // Успешная посадка
            if ((shuttle.speedX <= 5) && (shuttle.speedY <= 5) && (angle < 10) && (angle > -10) && (this.findPlateau(shuttle.x)==1)) {
                console.log("Congradulations!!!");
            }
            // Неудачная посадка
            else {
                //stage.app.removeChild(this.indicator);
                //this.indicator.remove();
                console.log("Crush!!!");
                
            }
          return yes
        }
        else{
          
          return false
        }
      }
    }

    // Отвечает за линии земли, стартовые условия марсохода в каждой миссии
    class Mission{
      


      //Настройка старта шатла
      shuttleX=1000;
      shuttleY=200;
      shuttleXSpeed=0;
      shuttleYSpeed=0;
      shuttleAngle=0;
      shuttleFuel=600;
      //Настройка поверхности
      level = [];


      constructor(shuttleX = 1000, shuttleY = 200, shuttleXSpeed = 0, shuttleYSpeed = 0, shuttleAngle = 0, shuttleFuel = 600, level) {
        // Настройка старта шатла
        this.shuttleX = shuttleX;
        this.shuttleY = shuttleY;
        this.shuttleXSpeed = shuttleXSpeed;
        this.shuttleYSpeed = shuttleYSpeed;
        this.shuttleAngle = shuttleAngle;
        this.shuttleFuel = shuttleFuel;
        // Настройка поверхности
        this.level = level;
        
      }
      
      // Все миссии
      static Missions = [ 
        new Mission(1000,200,0,0,0,600,levelFromPercentCoords( [[0,0],[0.1,0.4],[0.2,0.2],[0.3,0.7],[0.5,0.7]])   ),
        new Mission(1000,200,0,0,0,600,levelFromPercentCoords( [[0,0],[0.1,0.4],[0.2,0.2],[0.3,0.7],[0.5,0.7]])   ),
        
      ]


      runMission(shuttle){

        //Стираю что осталось с предыдущей миссии
        shuttle.x = this.shuttleX;
        shuttle.y = this.shuttleY;
        shuttle.speedX = this.shuttleXSpeed;
        shuttle.speedY = this.shuttleYSpeed;
        shuttle.shuttleAngle = this.shuttleAngle;
        shuttle.shuttleFuel = this.shuttleFuel;
      }
      static runAllMissions(shuttle){
        
        Missions.forEach((m) => {
          m.runMission(shuttle);
        });
      }

    }
    
    //Основной блок рисовки с использованием всех вспомогательных функций и классов 
    function update(){

      indicator.clear();
      indicator.beginFill(0xFFFF00);
      indicator.drawRect(shuttle.x-shuttle.width/2,rY(y),shuttle.width,5);

      
    }  
    

    land = new Land();
    Graf.moveTo(0,app.renderer.height);
    Graf.lineStyle(5, 0xFF0000);
    land.points.forEach((p) => Graf.lineTo(p.x,p.y) );
    update();
    Mission.Missions[0].runMission(shuttle);
    
    return land
    

  }
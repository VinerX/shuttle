var editor = ace.edit("userFunction");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
var missionIndex = 0;
var nextMissionFlag = false;
window.onload = function() {
  resetFunction();
};
//Кнопка сброса
function resetFunction() {
  editor.setValue(`function myFunction() {
  let acceleration = 0;
  let angle = 0;
  //Your code here
  return [acceleration, angle];
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
    validFunc = userFunc;
    acceleration = result[0];
    angle = result[1];
    app.ticker.start();
    //shuttle.x = defaultX;
    //shuttle.y = defaultY;
    //speed.x = 0;
    //speed.y = 0;
    MM.begin();
    console.log('the mission has begun')
    document.getElementById("result").innerHTML = "Function executed successfully. Result: " + result;
  }



  


  // Dmitry Code

  //app.renderer.height 1600
  //app.renderer.width для соотношения 1600 


  //Общие функции
  //Переворачивает y (Изначально он равен 0 вверху)

  height=1600;
  width=1600;
  class MissionManager{
    nextMission() {
      missionIndex++;
      
      if (missionIndex < Mission.Missions.length) {
          Mission.Missions[missionIndex].runMission(this.shuttle);
          this.Graf.clear();
          this.Graf.moveTo(0, height);
          this.Graf.lineStyle(5, 0xFF0000);
          this.land = new Land();
          this.land.points.forEach((p) => this.Graf.lineTo(p.x, p.y));
      }
      console.log(`${missionIndex} mission has begun ${shuttle.x} ${Point.rY(shuttle.y)}`)
    }
  
  
    Graf = new PIXI.Graphics();
    shuttle;
    // Обозначение поверхности ровно под марсоходом
    indicator = new PIXI.Graphics();
    text = new PIXI.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
    //app.stage.addChild(indicator);

    static y = 0; // Позиция y ПОД марсоходом
    land; // Совокупность линий

    //Основной блок рисовки с использованием всех вспомогательных функций и классов 
    update(){
      
      this.indicator.clear();
      this.indicator.beginFill(0xFFFF00);
      this.indicator.drawRect(this.shuttle.x-this.shuttle.width/2,Point.rY(MissionManager.y),this.shuttle.width,5);
      this.text.text = `X Speed ${ Math.round(this.shuttle.speedX) }
      Y Speed ${ (this.shuttle.speedY) }`;



      if (nextMissionFlag){
        MM.nextMission();
        nextMissionFlag = false;
      }
    }  
    get land(){
      return this.land;
    }
    constructor(shuttle){
      this.shuttle = shuttle;
      
      this.land = new Land();
      this.Graf.moveTo(0,height);
      this.Graf.lineStyle(5, 0xFF0000);
      this.land.points.forEach((p) => this.Graf.lineTo(p.x,p.y) );

      Mission.Missions[missionIndex].runMission(shuttle);
      app.stage.addChild(this.indicator);
      app.stage.addChild(this.Graf);
      app.stage.addChild(this.text);
      this.text.x = 0.8 * width;
      this.text.y = 0.8 * Point.rY(height); 
      this.update();
    }
    begin(){
      Mission.Missions[missionIndex].runMission(shuttle);
    }
    
    }
  
    //Обычный класс точки с x,y
    class Point{
      x;
      y;
      constructor(x,y) {
        this.x=x;
        this.y=Point.rY(y);
      } 
      static rY(y){
        return height-y
      }
    }

    // Создает точку по проценту от размера области
    function percentPoint(x,y){
      p = new Point(x,y);
      p.x= Math.floor(width*x);
      p.y= Math.floor(height-height*y);
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
      
      get level() {
        return Mission.Missions[missionIndex].level;
      }
    
      // level = Land.firstLevelLand;//[new Point(55,50), percentPoint(0.5,0.5),percentPoint(0.6,0.2)];
      //console.error("11");
      points = level.concat( [new Point(width,0)] );
      
      // Ищу Y, который скорее всего не задан точкой.
      findPointY(x){
        // Поиск ближайших точек
        var y;
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

        
        //Плато
        if (nearRight.y==nearLeft.y){
          y = Point.rY(nearLeft.y)
        }
        else {
          //Спуск
          if (nearLeft.y<=nearRight.y){
            y = ( Point.rY(nearLeft.y)-Point.rY(nearRight.y) ) * Math.abs(nearRight.x-x) / Math.abs(nearRight.x-nearLeft.x)+Point.rY(nearRight.y);
          }
          //подъем
          else{
            y = ( Point.rY(nearRight.y)-Point.rY(nearLeft.y) ) * Math.abs(nearLeft.x-x) / Math.abs(nearLeft.x-nearRight.x)+Point.rY(nearLeft.y);
          }
        }
        return Point.rY(y);
      }

      findPlateau(x){
        // Поиск ближайших точек
        var y;
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
      // тру если норм, false если краш
      hasColision(shuttle){
        
        var y = Point.rY(this.findPointY(shuttle.x));
        //console.log("HasCol0:"+y,Point.rY(shuttle.y));
        MissionManager.y = y;
        
        //Y Поверхности оказывается выше шаттла (с учетом погрешности)
        if ( y-1>Point.rY(shuttle.y)){
          console.log("HasCol1:"+y,Point.rY(shuttle.y));
          // Успешная посадка
          if ((shuttle.speedX <= 5) && (shuttle.speedY <= 5) && (angle < 10) && (angle > -10) && (this.findPlateau(shuttle.x)==1)) {
            console.log("Congratulations!!!");
            nextMissionFlag = true;
          }

          // Неудачная посадка
          else {
              //this.indicator.remove();
              console.log("Crush!!!");
          }
          return true
        }
        else  {
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
        //new Mission(200,500,0,0,0,600,levelFromPercentCoords( [[0,0]  ] )),
        new Mission(200,200,0,0,0,600,levelFromPercentCoords( [[0,0],[0.1,0.1],[0.2,0.1],[0.3,0.7],[0.5,0.7]])   ),
        
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
    


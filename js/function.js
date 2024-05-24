var editor = ace.edit("userFunction");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
let perfectLanding = new Audio('sound/success.mp3');
let kaboom = new Audio('sound/kaboom.mp3');
let theme = new Audio('sound/mars_wind.mp3');
let fanfare = new Audio('sound/fanfare.mp3');
var missionIndex = 0;
var nextMissionFlag = false;
let pixContainer = document.getElementById("background");
function saveCodeToLocalStorage() {
  var userCode = editor.getValue();
  localStorage.setItem('userCode', userCode);
}
window.onload = function() {
  var savedCode = localStorage.getItem('userCode');
  if (savedCode) {
    editor.setValue(savedCode);
  }
  else {
    resetFunction();
  }
  setInterval(saveCodeToLocalStorage, 5000);
};
//Кнопка сброса
function resetFunction() {
  editor.setValue(`function myFunction() {

  //Читаемые переменные.
  let X = MM.getData(1);
  let Y = MM.getData(2);
  let Sx = MM.getData(3);
  let Sy = MM.getData(4);
  let Fuel = MM.getData(5);
  let Points = MM.getData(6); //Массив координат точек. 
  //Пример: Points[0][1] - Значение координаты Y первой точки.
  
  //Настраиваемые переменные.
  let power = 3.71;
  let angle = 0;
  //Ваш код. Удачи! 
  return [power, angle];
}`);
}

//Кнопка запуска миссии
function runFunction() {
  var userCode = editor.getValue();
    saveCodeToLocalStorage();
    var userFunc;
    

    try {
      userFunc = new Function(`return ${userCode}`)();
      
    } catch (error) {
      document.getElementById("result").innerHTML = "Ошибка компиляции: " + error.message;
      return;
    }
  
    if (typeof userFunc !== "function") {
      document.getElementById("result").innerHTML = "Ошибка: введенный код не является функцией.";
      return;
    }
  
    var result;
    try {
      result = userFunc();
    } catch (error) {
      document.getElementById("result").innerHTML = "Ошибка выполнения: " + error.message;
      return;
    }
  
    if (!Array.isArray(result) || result.length !== 2) {
      document.getElementById("result").innerHTML = "Ошибка: функция должна вернуть массив двух чисел.";
      return;
    }
    var a = result[0];
    var b = result[1];
  
    if (typeof a !== 'number' || a < 0 || a > 10) {
      document.getElementById("result").innerHTML = "Ошибка: первый предмет массива должен быть между 0 и 10.";
      return;
    }
  
    if (typeof b !== 'number' || b < -90 || b > 90) {
      document.getElementById("result").innerHTML = "Ошибка: второй предмет массива должен быть между -90 и 90.";
      return;
    }
    validFunc = userFunc;
    power = result[0];
    angle = result[1];
    app.ticker.start();
    missionIndex = 0; // При кнопке ран начинаю с первой миссии
    background.style.display = "none";
    MM.beginAgain(); 
    console.log('the mission has begun')
    document.getElementById("result").innerHTML = "Функция принята. Выполняем симуляции... ";
  }



  


  // Dmitry Code

  //Связующий класс, отвечающий за общее состояние выполнения миссий
  class MissionManager{
    nextMission() {
      missionIndex++;
      
      // Если есть еще миссии
      if (missionIndex < Mission.Missions.length) {
          Mission.Missions[missionIndex].runMission(this.shuttle);
          this.Graf.clear();
          this.land = new Land();
          this.Graf.moveTo(0, height);
          this.Graf.lineStyle(5, 0xCC1E2C);
          this.land.points.forEach((p) => {this.Graf.lineTo(p.x, p.y)});
      }
      else{
        app.ticker.stop();
        fanfare.currentTime=0;
        fanfare.volume = 0.4;
        fanfare.play();
        alert('Вы прошли все миссии! Поздравляем! Вы - настоящий покоритель Марса.');
        fanfare.pause();
        theme.pause();
      }
      console.log(`${missionIndex} ${Mission.Missions.length} mission has begun ${shuttle.x} ${Point.rY(shuttle.y)}`)
    }
  
    // Графические объекты
    Graf = new PIXI.Graphics();
    shuttle; // Шатл, настроен в visual.js
    explosion = PIXI.Sprite.from('img/explosion.png'); //Взрыв
    indicator = new PIXI.Graphics(); // Обозначение поверхности ровно под марсоходом
    text = new PIXI.Text('This is a PixiJS text',{fontFamily : 'Arial', fontSize: 15, fill : 0xff1010, align : 'center'});    // Текст с данными о шатле
    y = 0; // Позиция y ландшафта  ПОД марсоходом
    land; // Совокупность линий

    //Основной блок рисовки с использованием всех вспомогательных функций и классов 
    update(){
      
      this.explosion.visible = false;
      this.indicator.clear();
      this.indicator.beginFill(0x1ECCBE);
      this.indicator.drawRect(this.shuttle.x-this.shuttle.width/2,Point.rY(MissionManager.y),this.shuttle.width,5);
      this.text.text = `Mission: ${missionIndex+1}/${Mission.Missions.length}
      Fuel: ${Math.round(this.shuttle.shuttleFuel*100)/100}
      X: ${Math.round(this.shuttle.x)}
      Y: ${Math.round(Point.rY(this.shuttle.y))}
      X Speed: ${ Math.round(this.shuttle.speedX*100)/100 }
      Y Speed: ${ Math.round(this.shuttle.speedY*-100)/100 }
      `;
      this.text.x=0.8 * width;
      this.text.y = 0.8 * Point.rY(height); 
      this.#flareUpdate();

      //Проверяю был ли фоаг, и на этой итерации меняю всю среду
      if (nextMissionFlag){
        MM.nextMission();
        nextMissionFlag = false;
      }
    }  

    get land(){
      return this.land;
    }


    //Создание ММ и инициализация всего
    constructor(shuttle){
      Mission.Missions[0].runMission(shuttle);
      this.shuttle = shuttle;
      this.land = new Land();
      this.Graf.moveTo(0,height);
      this.Graf.lineStyle(5, 0xCC1E2C);
      this.land.points.forEach((p) => this.Graf.lineTo(p.x,p.y) );


      app.stage.addChild(this.indicator);
      app.stage.addChild(this.Graf);
      app.stage.addChild(this.text);

      app.stage.addChild(this.explosion);
      this.explosion.visible = false;

      


      this.text.x = 0.8 * width;
      this.text.y = 0.8 * Point.rY(height); 
      this.update();
    }
    
    beginAgain(){
      theme.currentTime=0;
      theme.play()
      kaboom.pause();
      kaboom.currentTime =0;
      Mission.Missions[missionIndex].runMission(shuttle);
      this.Graf.clear();
      this.land = new Land();
      this.Graf.moveTo(0,height);
      this.Graf.lineStyle(5, 0xCC1E2C);
      this.land.points.forEach((p) => this.Graf.lineTo(p.x,p.y) );

    }
    //Обработка взрыва
    crush(){
      kaboom.volume=0.4;
      kaboom.play();
      theme.pause();
      this.explosion.visible = true;
      this.explosion.width = this.shuttle.width;
      this.explosion.height = this.shuttle.height;
      this.explosion.x = this.shuttle.x-this.shuttle.width/2;
      this.explosion.y = this.shuttle.y-this.shuttle.height/2;
    }
    #flareUpdate(){
      //Нормализация (val, max, min) => (val - min) / (max - min); 
      //Тут будет настройка графики отображения пламени  
      flare.alpha = 0.85+0.15*Math.random(1) //Math.round(power) )//(power - 0) / (3.71 - 0); 
      flare.width = 1500*Math.round(power); 
    }

    // Функция для пользователя, он получает только копии так что не может ничего менять
    getData(data){
      switch (data){
      case 1: return this.shuttle.x;
      case 2: return Point.rY(this.shuttle.y); 
      case 3: return this.shuttle.speedX;
      case 4: return -1*this.shuttle.speedY; 
      case 5: return this.shuttle.shuttleFuel; 
      case 6: return this.land.pointsForUser();
      default: console.error("Unsupposed value");
      }
      
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
      //Переворачивает y (Изначально он равен 0 вверху)
      static rY(y){
        return height-y
      }
      // Создает точку по проценту от размера области
      static percentPoint(x,y){
        var p = new Point(x,y);
        p.x= Math.floor(width*x);
        p.y= Math.floor(height-height*y);
        return p;
      } 
    }
    
    
    // Отвечает за линии земли и коллизию с ними
    class Land{    
      // крайняя точка слева, затем беру точки из миссии, затем 0,0 справа
      points=[new Point(-200,0)];

      // Создает левел из процентных точек (Более универсально)
      levelFromPercentCoords(coords){
        var level=[];
        coords.forEach(p => {
          level.push( Point.percentPoint(p[0],p[1]));
        });
        return level;
      }


      constructor() {
        this.points = this.points.concat( this.levelFromPercentCoords(Mission.Missions[missionIndex].level))
        this.points = this.points.concat( [new Point(width+200,0)] ); 
      }
      
      pointsForUser(){
        var newPoints = [];
        this.points.forEach(p => {
          newPoints.push( [p.x,Point.rY(p.y)]);
        });
        // Убираю первый и последний элемент, так как они за пределами видимости.
        newPoints.shift()
        newPoints.pop();
        return newPoints;
      }
      //Находит ближайшие точки слева и справа и возвращает массивом
      nearPoints(x){
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
        return [nearLeft,nearRight]
      }

      // Ищу Y, который скорее всего не задан точкой.
      findPointY(x){
        // Поиск ближайших точек
        var y;
        let [nearLeft, nearRight] = this.nearPoints(x);      
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
      //Поиск плато
      isPlateau(x){
        let [nearLeft, nearRight] = this.nearPoints(x);   
        // Это плато
        if(nearRight.y==nearLeft.y) {
          return true 
        }
        // Есть уклон
        else{
          return false
        }     
      }
      // Проверка коллизиии тру если норм, false если краш
      hasColision(shuttle){
        var y = Point.rY(this.findPointY(shuttle.x));
        //console.log("HasCol0:"+y,Point.rY(shuttle.y));
        MissionManager.y = y;
        //Y Поверхности оказывается выше шаттла (с учетом погрешности)
        if ( y+(shuttle.height/2)-3>Point.rY(shuttle.y)){
          //console.log("HasCol1:"+y,Point.rY(shuttle.y));
          // Неудачная посадка
          if ((shuttle.speedX > 5) || (shuttle.speedX <-5)) {
            console.log("Crush!!!");
            MM.crush();
            MM.text.text = `Crush Cause - the
            horizontal
            speed was 
            too high`;
          }
          else if((shuttle.speedY > 5)){
            console.log("Crush!!!");
            MM.crush();
            MM.text.text = `Crush Cause - the 
            vertical speed
            was too high`;
          }
          else if((angle >= 10) || (angle <= -10)){
            console.log("Crush!!!");
            MM.crush();
            MM.text.text = `Crush Cause - 
            the angle
            was too high`;
          }
          else if(!(this.isPlateau(shuttle.x-shuttle.width/2)) || !(this.isPlateau(shuttle.x)) || !(this.isPlateau(shuttle.x+shuttle.width/2)))  {
            console.log("Crush!!!");
            MM.crush();
            MM.text.text = `Crush Cause - you 
            are landing
            not on plateau`;
          }
          // Удачная посадка
          else {
            perfectLanding.play();
            console.log("Congratulations!!!");
            nextMissionFlag = true;
          }
          return true;
        }
        //Улет более чем на 25% границ справа или сверху
        else if(Point.rY(shuttle.y)>=1.25*height || shuttle.x<=-0.25*width || shuttle.x>=1.25*width){
          MM.crush();
          MM.text.text = `Crush Cause - you 
          leave
          land area`;
          console.log("Far distance");
          return true;
        } 
        else  {
          return false;
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
        // Новые по концептам
        new Mission(0.5,0.2,0,0,0,1600, [[0.0,0.5],[0.2,0.4],[0.3,0.55],[0.4,0.4],[0.6,0.4],[0.7,0.8],[0.8,0.7],[1,0.6] ]   ),
        new Mission(0.25,0.3,0,0,0,1600, [[0.0,0.4],[0.2,0.6],[0.3,0.45],[0.4,0.35],[0.6,0.4],[0.7,0.3],[0.9,0.3],[1,0.8] ]   ),
        new Mission(0.12,0.3,1,0,0,1600, [[0.0,0.3],[0.1,0.31],[0.15,0.65],[0.25,0.55],[0.30,0.6],[0.37,0.79],[0.40,0.3],[0.45,0.1],[0.50,0.3],[0.65,0.6],[0.68,0.72],[0.71,0.5],[0.75,0.45],[0.86,0.45],[0.99,0.9]]    ),
        new Mission(0.9,0.15,0,0,0,1600, [[0,0.8],[0.2,0.8],[0.27,0.55],[0.4,0.45],[0.5,0.50],[0.6,0.65],[0.75,0.55],[0.9,0.67],[1,0.63] ]   ),
        
        //Старые
        //new Mission(1000,200,0,0,0,1600,levelFromPercentCoords( [[0.1,0.4],[0.2,0.2],[0.3,0.7],[0.5,0.7]])   ),
        //new Mission(200,500,0,0,0,1600,levelFromPercentCoords( [[0.1,0.4],[0.9,0.4]  ] )),
        //new Mission(200,200,0,0,0,1600,levelFromPercentCoords( [[0.1,0.1],[0.2,0.1],[0.3,0.7],[0.5,0.7]]),   ),
        //new Mission(500,200,0,0,0,1600,levelFromPercentCoords( [[0.1,0.9],[0.2,0.1],[0.2,0.4],[0.9,0.9]]),   ),
      ]


      runMission(shuttle){
        
        //Стираю что осталось с предыдущей миссии
        if (this.shuttleX<=1){
          shuttle.x = width*this.shuttleX;
        }
        else{
          shuttle.x = this.shuttleX;
        }
        if (this.shuttleY<=1){
          shuttle.y = height*this.shuttleY;
        }
        else{
          shuttle.y = this.shuttleY;
        }
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
    


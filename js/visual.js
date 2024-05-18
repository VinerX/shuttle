//visualization

const gravity = 3.71;
//Работа с пользователем
var power = 0.978;
var angle = 0;
var FuelUsage = 0;
let validFunc = new Function('return[0,0]');
let funcResult = [0,0];
// Для чтения пользователю
//const X = parseInt(inputs[0]);
//const Y = parseInt(inputs[1]);
//const hSpeed = parseInt(inputs[2]); // the horizontal speed (in m/s), can be negative.
//const vSpeed = parseInt(inputs[3]); // the vertical speed (in m/s), can be negative.
//const fuel = parseInt(inputs[4]); // the quantity of remaining fuel in liters.
//const rotate = parseInt(inputs[5]); // the rotation angle in degrees (-90 to 90).
//const power = parseInt(inputs[6]); // the thrust power (0 to 4).




//Приложение
var app;
var height;
var width;
//Настройка шатла
const shuttle = PIXI.Sprite.from('img/shuttle2.png');
const flare = PIXI.Sprite.from('img/lens2.png');
var defaultX =600;
var defaultY =204;
let xSpeed, ySpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
  let pixContainer = document.getElementById("shuttle-holder");
    // Create a new PIXI Application
    app = new PIXI.Application({
      width: pixContainer.clientWidth,
      height: pixContainer.clientHeight,
      antialias: true,
      transparent: false,
      resolution: 1
    });
    height = app.renderer.height;    
    width = app.renderer.width;

    // Resize the renderer when the container size changes
    window.addEventListener('resize', function() {
      app.renderer.resize(pixContainer.clientWidth, pixContainer.clientHeight);
      height = app.renderer.height;
      width = app.renderer.width;
      shuttle.width = height*0.15; // 15% От всей высоты размер шатла
      shuttle.height = height*0.15;
    });
  
    if(pixContainer) {
      pixContainer.appendChild(app.view);
  
      // Now you can start creating sprites and adding them to stage.
      app.stage.addChild(shuttle);
      shuttle.width = height*0.15; // 15% От всей высоты размер шатла
      shuttle.height = height*0.15;
      shuttle.anchor.set(0.5, 0.5);
      shuttle.x = 100; //defaultX;
      shuttle.y = 100; //defaultY;
      shuttle.speedX = 0;
      shuttle.speedY = 0;
      shuttle.shuttleAngle = this.shuttleAngle;
      shuttle.shuttleFuel = this.shuttleFuel;
      shuttle.pX1=this.pX1;
      shuttle.pX2=this.pX2;
      shuttle.pY=this.pY;
      
      //Пламя под шатлом
      shuttle.addChild( flare);
      flare.anchor.x = 0.5;
      flare.anchor.y = 0.2;


      // Установка среды для шатла
      MM = new MissionManager(shuttle);
          
      // Старт только по кнопке
      app.ticker.stop();
      // Тик времени
      app.ticker.add((delta) => {
        


        // Обработка функцией пользователя значений с получением значений угла и ускорения
        funcResult = validFunc();

        //Проверка топлива
        if(shuttle.shuttleFuel-power>0){
          power = funcResult[0];
        }
        else{
          power=shuttle.shuttleFuel;
        }
        shuttle.shuttleFuel = shuttle.shuttleFuel-power;
        angle = funcResult[1];
    
        // Обновление среды (кроме шатла) в данной итерации 
        MM.update(); 

        //Проверка коллизии
        if (MM.land.hasColision(shuttle)) {
          console.log(MM.land+`Visual: Collision ${shuttle.x} ${ Point.rY(shuttle.y)}`);
          if (!nextMissionFlag){
            app.ticker.stop();
          }
          
        }
        else  {
          // Convert angle from degrees to radians and adjust by -90 degrees
          var angleInRadians = (angle) * (Math.PI / 180);
          shuttle.rotation = angleInRadians;
          //gravity
          shuttle.speedY += gravity * delta;
      
          // Correct y speed calculation: positive should go down in screen coordinates, but we want up
          shuttle.speedX += Math.sin(angleInRadians) * power * delta;
          shuttle.speedY -= Math.cos(angleInRadians) * power * delta;
          
          let newX = shuttle.x + shuttle.speedX;
          let newY = shuttle.y + shuttle.speedY;
      
          // Prevent shuttle from going below container height,
          if(newY >= app.renderer.height - (shuttle.height / 2)) {
              newY = app.renderer.height - (shuttle.height / 2);
              shuttle.speedY = 0; // Reset vertical speed upon "landing"
              shuttle.speedX= 0.95; // Optionally apply horizontal friction
          }
        
          // Update sprite position with new values.
          shuttle.x = newX;
          shuttle.y = newY;
        
          // Rotate sprite based on original degree value minus offset
          shuttle.rotation = angleInRadians;
        }; 
        xSpeed = shuttle.speedX;
        ySpeed = shuttle.speedY; 
      });
      

    
    } 

    else {
      console.error("Could not find the '#pixi-container' element.");
    }
  }
);

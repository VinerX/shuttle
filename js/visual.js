//visualization
const acceleration = 0.978;
const gravity = 0.98;
var app;

//Настройка шатла
const shuttle = PIXI.Sprite.from('img/shuttle.png');
var angle = 0;
var FuelUsage = 0;
var defaultX =600;
var defaultY =204;

document.addEventListener('DOMContentLoaded', () => {
    // Create a new PIXI Application
    app = new PIXI.Application({
        width: 1600,         // default: 800
        height: 1600,        // default: 600
        antialias: true,    // default: false
        transparent: false, // default: false
        resolution: 1       // default: 1
      }
    );
  
    //Add the canvas that Pixi automatically created for you to the HTML document
    let pixContainer = document.getElementById("shuttle-holder");
  
    if(pixContainer) {
      pixContainer.appendChild(app.view);
  
      // Now you can start creating sprites and adding them to stage.
      app.stage.addChild(shuttle);
      shuttle.anchor.set(0.5, 0.5);
      shuttle.x = 600; //defaultX;
      shuttle.y = 204; //defaultY;
      shuttle.speedX = 0;
      shuttle.speedY = 0;
      shuttle.shuttleAngle = this.shuttleAngle;
      shuttle.shuttleFuel = this.shuttleFuel;
      
      
      
      MM = new MissionManager(shuttle);

     
      

      // Так понял что это тик времени
      
      app.ticker.add((delta) => {
        //Проверка колизии
        //land.update()
        land = MM.land;
        if (land.hasColision(shuttle)) {
          console.log("Collision")
          
        }
        else{
          // Convert angle from degrees to radians and adjust by -90 degrees
          var angleInRadians = (angle) * (Math.PI / 180);
          //gravity
          shuttle.speedY += gravity * delta;
      
          // Correct y speed calculation: positive should go down in screen coordinates, but we want up
          shuttle.speedX += Math.sin(angleInRadians) * acceleration * delta;
          shuttle.speedY -= Math.cos(angleInRadians) * acceleration * delta;
          
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
      });

    
    } 




    else {
      console.error("Could not find the '#pixi-container' element.");
    }
  }
);

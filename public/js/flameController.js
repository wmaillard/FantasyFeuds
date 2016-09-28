	

	var controller = {
			canvas : null,
			context : null,
			particles : {},

			init : function(x, y, id){
				if(this.particles[id]){
					return
				}
				console.log('yooooooooooo')
				this.canvas = document.getElementById( "explosions" );
				this.context = this.canvas.getContext( "2d" );
				this.context.globalCompositeOperation = "lighter"; //"source-over", "lighter", "darker", "xor"  are good

				


					var part = new cParticleSystem();
					part.position = Vector.create( x, y );

					var p3 = new cParticleSystem();

					var p2 = new cParticleSystem();	

					// Set some properties - check the class
					p2.position = Vector.create(x, y);

					p3.position = Vector.create( 500, 400 );

					p2.startColourRandom = [ 255, 255, 255, 1 ];
					p2.endColourRandom = [ 255, 255, 255, 1 ];
					p2.size = 20;
					p2.maxParticles = 20;


					//part.init();
					p2.init();
					//p3.init();
				//	this.particles.push(part);
					this.particles[id] = p2;
				//	this.particles.push(p3);

				

				this.main();
			},

			main : function(){
				this.update();
				this.draw();
				setTimeout( function(){ controller.main(); }, 200 );
			},

			update : function(){	
				for(var part in this.particles){
					this.particles[part].update(1);
				}
			/*	this.p1.update( 1 ); // "1" is used as a delta... should be calculated as time between frames
				this.p2.update( 1 );
				this.p3.update( 1 );*/
			},

			draw : function(){
				this.context.clearRect( 0, 0, this.context.canvas.width, this.context.canvas.height );
				for(var part in this.particles){
					this.particles[part].render( this.context );
				}
			/*	this.p1.render( this.context );
				this.p2.render( this.context );	 
				this.p3.render( this.context );	*/
			}
		};
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16), 
        1
    ] : null;
}

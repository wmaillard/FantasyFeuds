	

	var controller = {
			canvas : null,
			context : null,
			particles : {},

			init : function(x, y, eId, vId){
			/*	if(this.particles[id]){
					return
				}*/
				return; 
				console.log('yooooooooooo')
				this.canvas = document.getElementById( "explosions" );
				this.context = this.canvas.getContext( "2d" );
				this.context.globalCompositeOperation = "lighter"; //"source-over", "lighter", "darker", "xor"  are good

			

					this.p1 = new cParticleSystem();	

					// Set some properties - check the class
					this.p1.position = Vector.create(x, y);



					this.p1.startColourRandom = [ 255, 255, 255, 1 ];
					this.p1.endColourRandom = [ 255, 255, 255, 1 ];
					this.p1.size = 20;
					this.p1.maxParticles = 20;
					this.p1.duration = 50;


					//part.init();
					this.p1.init();


				console.log('eId:', eId, 'vId: ', vId);
				attackEffects[(cantor(eId, vId))] = this.p1;
				if(!attackEffectsLoop){
					attackEffectsLoop = true;

					this.main();
				}
			},

			main : function(){
				this.update();
				this.draw();

				this.timer = setTimeout( function(){ controller.main(); }, 200 );


			},

			update : function(){	
				for(var p in attackEffects){
					attackEffects[p].update(1);
				}

			},

			draw : function(){
				this.context.clearRect( 0, 0, this.context.canvas.width, this.context.canvas.height );
				for(var p in attackEffects){
					attackEffects[p].render( this.context );
				}
				
			}
		};


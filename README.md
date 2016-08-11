# staticFilesRTS
##TODO

##Post Midterm Check
--------------------------------------------------------------------------------------------------------------------------------
##U.I.
- [x] *BUG -> Either drawing entites or placing entities is not relative to offest * zoom -- issue may be partially because the game is drawn on the right side when zoomed out.  **Offset of entity needs to be multiplied by zoom, offset is there , just not high enough.
- [x] Went away on its own? ~~Critical BUG -> Logging in from the Map and hitting cancel causes map to freeze.  Probably something to do with 'pause' not being set correctly~~
- [x] Turn down the framerate or give the option to.  Make walking speed relative to framerate! 
- [x] Just turn down the panning frame rate for now, no time to reconfigure loading layers (in regard to flattening).
- [x] You're loading entities too many times on pan.  Just create one giant layer ctx then add entities and then pan that around instead of drawing them every time.  Store the original and revert after pan. -- Somewhat fixed, entites are drawn on top layer, if layers are flattened, may need to change this.
- [x] Edit maps so that you can walk over bridges and under the wall
- [x] Add bases to the map and mark there location as BaseN and BaseS in the blocking terrain array
- [x] Fix bug where if window is too wide then map is loaded on the left, then on pan it jumps to the right and the old one is still there
- [x] Highlight entity when current.  
- [x] Show healthbar for everybody always
- [x] more entities
- [ ] save state (just save the entities), easy peasy
- [ ] still releveant?, depends on how AI is set up. change entity from attacking to defending somehow with UI (right click?, macs don't do that do they...ctrl-click or right click)
- [x] draw another map :)

##A.I.
- [ ] Click to select an entity and then click somewhere else for them to go there (also, drag to select multiple entities would be neat).
- [ ] Have entities recognize when they are near an enemy and attack/defend if they are within range
- [ ] Have entites heal at their base?
- [ ] Have entities travel to their 'heading' intelligently.
- [ ] Have enemy team attack/defend intelligently.  
- [ ] Create a main base for each team and if health == zero game over
- [ ] Have enemy team pick entities intelligently
- [ ] Create two different settings for A.I. easy/hard

##Backend
- [x] API
- [x] Router
- [x] Player Database
- [x] PW encrpyption/Decryption
- [x] Auth Tokens (Create/Validate)
- [x] Register
- [x] Login
- [x] Get  player level
- [x] Save player level
- [x] Fix CORS Auth Headers
- [x] Save Game
- [x] Load Saved Game
- [ ] Load Multiple Saves
- [ ] Load level data
- [ ] *BUG -> Goroutine crash when JWT uname doesn't match route. Correct action is still taken and this is invisible to the user.*

##Pre Midterm Check
--------------------------------------------------------------------------------------------------------------------------------
- [x] Hook Login to backend
- [x] Login name in navBar
- [x] Click to add an entity
- [x] Move all of the files into a public nodejs directory so that heroku can run this all the time
-  [x] Create an entity object with the following attributes
  * x, y coords (this should be based on whole map size not just window)
  * array of .png files or maybe one which can be sliced
  * fun attributes like health, direction pointing, attacking, defending, heading
- [x] Create a function that loads an entity an xy on the map (window xy, not map xy)
- [x] Have the entity move across the screen
- [x] Make entities avoid things somewhat intelligently
- [x] Create a function, "Is something there?" to check if an entity is blocked
 - [x] Probably need to create an array of true/false coordinates while building levels, including outside the visible map, only need to do this once! Not every time the background reloads
- [x] Make zoom and pan work with entities - This includes having entites offscreen that can be panned to.
- [x] Load up the maps
- [x] Draw the maps
- [x] Load up the terrain
- [x] Main page with login form
- [x] Level select


##Fancy ideas that we may never get to
--------------------------------------------------------------------------------------------------------------------------------
- [x] Cache loading the background for better performance
- [ ] Resize the map on a window resize
- [ ] Create more precise outlines of terrain so entities can move closer to them, instead of avoiding their box entirely
- [x] Mobile touch commands
- [x] Panning could be better because background and entities are refreshed at different rates so entities jump a little, maybe if(panning) refresh entity to current state -- This may be an easy fix
- [ ] Token Invalidation for logout/new token requests
- [ ] Memcache of Invalid Tokens to compare to until timeout date
- [ ] *BUG -> Fix '\n' appeneded to http response from .Encode()* -- I don't think this matters now, JQuery can deal with it if you don't tell it to expect JSON - Will
- [ ] There may be issues with dragging too quickly outside the window, need to work on the limitOffset function.  --Look at setTimeOut instead of setInterval for dynamically changing fps
- [ ] Stop loading every layer every time, instead flatten and store. Should boost speed.  (this will break drawEntitiesBackground, will need to slightly edit this) --> Probably should flatten then create a function to just redraw certain layers, or even better flatten all top layers and flatten bottom layers then load in the order bottom -> entities -> top.  May be able to edit scene.load to take an arguement and load either tops or bottoms.  That means that top will need to be loaded every time an entity is animated, is this a problem?  So infrequent that it may not matter
- [ ] Massively refactor the code to include many files using require.js .  Separate things out in a more OOP way and get rid of global variables.
- [ ] Refactor backend to further seperate concerns
- [ ] Refactor backend error handling
- [ ] UI for adding an entity - ~~Probably figure out how to add a <canvas> in the nav menu,~~ could use draggable jquery!!!
- [ ] Colors for teams/team item in entity
- [ ] Stagger walking, surprisingly will take a lot of work.  Think it out, should this be the draw entities job or the walking function?  Should each entity be on its own ctx?  Because if you clear all the entities at once, they have to walk at the same pace. oooh could you do giant.ctx = ctx, then just clear and draw that somewhere on the canvas like scratch canvas?

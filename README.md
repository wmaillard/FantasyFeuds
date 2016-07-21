# GOTRTS
##TODO
- [x] Move all of the files into a public nodejs directory so that heroku can run this all the time
- [ ] Create a login form that hooks up with the backend
- [x] Create an entity object with the following attributes
  * x, y coords (this should be based on whole map size not just window)
  * array of .png files or maybe one which can be sliced
  * fun attributes like health, direction pointing, attacking, defending, heading
- [x] Create a function that loads an entity an xy on the map (window xy, not map xy)
- [x] Have the entity move across the screen
- [x] Create a function, "Is something there?" to check if an entity is blocked
  - [x] Probably need to create an array of true/false coordinates while building levels, including outside the visible map, only need to do this once! Not every time the background reloads
- [ ] Edit maps so that you can walk over bridges and under the wall
- [x] Make zoom and pan work with entities - This includes having entites offscreen that can be panned to.
- [ ] UI for adding an entity - Probably figure out how to add a <canvas> in the nav menu

--------------------------------------------------------------------------------------------------------------------------------
##Fancy ideas that we may never get to
- [x] Cache loading the background for better performance
- [ ] Resize the map on a window resize
- [ ] Create more precise outlines of terrain so entities can move closer to them, instead of avoiding their box entirely
- [x] Mobile touch commands
- [x] Panning could be better because background and entities are refreshed at different rates so entities jump a little, maybe if(panning) refresh entity to current state -- This may be an easy fix

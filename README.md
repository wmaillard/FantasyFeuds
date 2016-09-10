# GOTRTS (name pending, should change this soon)

##Quick Description
- The goal of this project is to eventually create a Massively Multiplayer Online Real Time Strategy Game from scratch (i.e. without the user of a written game engine or game development environment).
- This game is currently in development (alpha) and the main branch is live here: http://gotrtswm.herokuapp.com/ and the 'working' branch periodically live here: http://gotrtswm.herokuapp.com/

###Plan of attack
- The general flow of the game will be as follows (This will be eventually made clearer with a nice chart):
 - The user adds and controls their characters
 - The server (connected using socket.io, probably) checks that all changes are valid compared to the last state that the user submitted (what is checked and how often is still up for debate).  The server gives the all clear periodically or forces the client into a state.
  -The only issue here is that much of the code on the client and server will be redundant, which might not be a bad thing, since both will be running in Javascript.
- The hope is to set this structure up as a backbone, then slowly branch off and take care of details.  There needs to be careful planning to ensure that everything is scalable (from the number of calculations given to the server to the graphics processing by the client.)




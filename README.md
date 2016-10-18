# Asteroids
An clone of the arcade classic [Asteroids](https://en.wikipedia.org/wiki/Asteroids_(video_game)) in HTML5,
created for the Fall 2016 class of CIS 580 at Kansas State University.

## Requirements

You will be building a clone of Asteroids, where the purpose is to pilot a ship through an astroid field without dying.

You may use the art provided, or your own.  Additionally, you do not need to make your game concern asteroids - as long as the core game mechanic is the same, feel free to explore.

1. Your game should involve steering a player's ship around space.  Should you move off-screen, your player should wrap back on-screen on the opposite side (10 points).

2. You should render a significant number (at least ten) asteroids on screen.  If all asteroids are destroyed, a new level with more asteroids is begun (10 points).

3. Asteroids should move along an initially random velocity vector.  If they move off-screen, they should wrap to the opposite side of the screen (10 points).

4. Asteroids that collide with one another should break away from each other according to Newtonian mechanics while playing a sound effect.  Asteroids should be of different masses, determined randomly when created (20 points).

5. Asteroids destroy the player's ship when collided with, playing a sound effect.  The player begins with three lives, which are displayed in a GUI (10 points).

6. The player may shoot lasers, which travel across the screen and disappear when they cross the edge.  They also play a sound effect when fired (10 points).

7. A laser will break an asteroid into two or more smaller pieces when it hits them.  These pieces have part of the original asteroid's mass, and velocities that move away from each other. If an asteroid is small enough, it is simply destroyed. (20 points).

8. The player's score, level, and lives are displayed on the game screen in some fashion - either through the _drawText()_ method or via an HTML element overlayed on the game screen.  Instructions on how to play the game appear in some easily-accessible fashion, i.e. on the page, or over the game screen accessed with the _esc_ key (10 points).

### Extra Credit

1. The ship can warp to a random location on screen when a button is pressed (10 points).

2. UFOs appear periodically and shoot at the player.  These can be destroyed with lasers (10 points).

3. There is an additional bonus of 10 points that can be awarded for an exceptional game design (10 points).

## Bundling
The source code in the src directory is bundled into a single file using **Browserify**.  The Browserify tools must first be installed on your system:

```$ npm install -g browserify``` (for OSX and linus users, you may need to preface this command with ```sudo```)

Once installed, you can bundle the current source with the command:

```$ browserify src/app.js -o bundle.js```

Remember, the browser must be refreshed to receive the changed javascript file.

## Watching

You may prefer to instead _watch_ the files for changes using **Watchify**.  This works very similarily to Browserify.  It first must be installed:

```$ npm install -g watchify``` (again, ```sudo``` may need to be used on linux and OSX platforms)

Then run the command:

```watchify src/app.js -o bundle.js```

The bundle will automatically be re-created every time you change a source file.  However, you still need to refresh your browser for the changed bundle to take effect.

## Credits
Game framework HTML5/CSS3/Javascript code was written by course instructor Nathan Bean, and released under a CC-BY license.

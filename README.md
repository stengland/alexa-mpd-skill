# Alexa MPD Skill

This is a basic Alexa skill that allows control of an [MPD
server](https://www.musicpd.org/).  The MPD server must have a publicly
accessible URL.  This should be easily achievable with port forwarding and
dynamic DNS or a fixed IP.

I have not tested with [Mopidy](https://mopidy.com/) but in theory it should
work.

It uses the [mpd-api module](https://github.com/cotko/mpd-api)

It just has basic features as that is all I need (I mostly use
[ncmpcpp](https://rybczak.net/ncmpcpp/)) but should serve as a good basis to
extend into an all singing all dancing MPD control.

FYI I use MPD with [Snapcast](https://github.com/badaix/snapcast) for multi room
audio (as Alexa's sucks).

## Installation

You should be able to import this as an Alexa hosted skill directly from this
git repo, I have not tried this my self though. Instructions here (let me know
how you get on).

https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-git-import.html

Enjoy!

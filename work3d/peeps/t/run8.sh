#!/bin/bash
# usage: run8.sh pose... (env SCL ONLY CH)
cd /home/claude/suite-xiii && (python3 -m http.server 8765 >/dev/null 2>&1 & echo $! > /tmp/srv.pid; sleep 1; cd /home/claude/work3d/peeps/t && NODE_PATH=$(npm root -g) node t8.js /tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad "$@"; kill $(cat /tmp/srv.pid))

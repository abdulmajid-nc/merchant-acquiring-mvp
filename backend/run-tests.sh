#!/bin/bash
npm test > test-output.log 2>&1
echo "Tests completed. Check test-output.log for results."

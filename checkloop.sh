#!/bin/bash
printf "last check on `date`\n" >> checkloop.log
node pup.js "$1" |grep "available: true" && true

while [ "$?" != "0" ]
do
sleep "$[($RANDOM % 120) + 1]"
printf "last check on `date`\n" >> checkloop.log
node pup.js "$1" |grep "available: true" && true
done

aws sns publish --topic-arn "arn:aws:sns:eu-west-1:647799808205:avTopic" --message "Disponible $1" --profile mamurciegosns

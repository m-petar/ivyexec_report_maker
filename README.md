# ivyexec_report_maker
Chrome extension

<p>This app automates the task of checking the status of job advertisements posts on Ivyexec website.
When done manually, this consists of checking if a certain company account on Ivyexec website was posted into for the given period of time. 
Then, using the right credentials, logging into each company account, browsing through job advertisements posts, page by page, and checking each job post's status that can either be active, pending, expired, disapproved or disabled; then logging out and repeating the process again for another company account and so on. </p>

<h3>Installation </h3>
<p>Download as a .zip file, then extract. <br/>
In Google Chrome navigate to Settings> More Tools> Extensions. <br/>
Enable Developer mode and click Load unpacked, then navigate to the location of unzipped extension folder and open it.</p> 

<h3>Usage</h3>
<p>Copy Google sheet url.<br/>
Click on extension icon next to browser address bar.<br/>
Paste url into Sheet Url field.<br/>
Select the dates and click on Generate Company List. <br/>
This will generate a table containing companies' names and credentials. Only companies' accounts that have been posted into within the selected date range would be included in it.<br/>
Click generate report. <br/>
Extension will then open login webpage to execute the task.<br/>
The script will automatically log into each listed company account and browse through it creating a report containing how many jobs were posted into the company account for the selected date range and also sort those jobs according to their status. At the end you will be prompted to save a report in .csv file.</p>

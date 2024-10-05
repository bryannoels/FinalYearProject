# LABA
Leveraging Analytics for Building Assets
Developed by Bryan Noel Salindeho and Frewin Suriono (2024)

## Main Objectives
Develop an android web portal optimised for android view with English interface where the users are able to find the best stock investment that is suited for them by giving recommendations based on user selected criteria.

## Background
More people are realising the importance of investment. This project aims to provide easy access for users to make informed decisions and manage their investment portfolio by giving predictions of stock value. According to BankMyCell [1], Android users make up 69.9% of the quarterly market share in Q1 2024. Therefore, by choosing to focus our development on the Android platform, we will be able to reach most of the mobile users. 

The increase of investors over the recent years are mostly retail investors, which refers to people with lacking financial knowledge or unprofessional investors. To help bridge the gap of knowledge, this project will provide information, such as data of the company performance and prediction, to the users for them to make informed-decisions on their investment portfolio. The prediction will be based on past trends, market value, company profits, and earnings per share consistency.

**References**
[1] BankMyCell, "Android vs iPhone market share: 2023 statistics," Jul. 2023. [Online]. Available: https://www.bankmycell.com/blog/android-vs-apple-market-share/. [Accessed: Sep. 14, 2024].

## Proposed Way of Carrying Out Project Tasks

**Front End**
The frontend consists of two key sections: a login page and a dashboard. The login page is designed for secure access, featuring intuitive input fields for username and password, with options like "Forgot Password" and "Remember Me" for convenience. Once logged in, users are greeted by a dashboard that displays the current stock information along with their intrinsic values. The dashboard presents stock details such as names, symbols, and real-time market prices, enhanced with charts or tables for better visualisation. Users can interact with the dashboard to filter or search for specific stocks to gain deeper insights into market performance.

Programming language that will be used: 
- Web portal: HTML, CSS, JavaScript, React
- Library for charts/graph
- Gson library to convert and manage json object

**Back End**
Based on research, development and testing for backend is estimated to still be within AWS services free-tier plan. Therefore, we will leverage on AWS services free-tier plan for backend hosting as AWS Services are able to provide infrastructure, auto-scaling and pay-on-demand. Auto-scaling and pay-on-demand features are useful when the web portal is commercialised.

Programming languages that will be used:
- Python
- Express (JavaScript)
- SQL/mySQL

AWS Services that will be used:
- IAM (required)
- API Gateway
- Lambda Function
- EC2
- S3 bucket
- MongoDB

## Proposed Weekly Schedule

**Semester 1**
Week 2 - Week 6: Research
Week 5 - Recess: Wireframe (UI/UX) and Database Design
Recess - Week 8: Setup backend, database, repository (simple functionality)
Week 8 - Week 10: First Iteration of the feature
Week 10 - Week 12: Second Iteration of the feature (merge)
Week 12 - Week 13: Interim Report
Reading Week: Integration and Testing
Winter Break: Refinement and Adjustment

**Semester 2**
Week 1 - Week 3: Start the second feature
Week 3 - Week 5: Second Iteration
Week 5 - Recess: Finalise and refinement
Recess - Week 12: Integration and Testing



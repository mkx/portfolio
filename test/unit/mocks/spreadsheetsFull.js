// perl -pe 's/[\n]//g' < test/unit/mocks/spreadsheetsFull.xml

var spreadsheetsFullXml = "<?xml version='1.0' encoding='UTF-8'?><feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/'>    <id>https://spreadsheets.google.com/feeds/spreadsheets/private/full</id>    <updated>2015-01-04T11:16:55.923Z</updated>    <category scheme='http://schemas.google.com/spreadsheets/2006' term='http://schemas.google.com/spreadsheets/2006#spreadsheet'/>    <title type='text'>Available Spreadsheets - email@mail.com</title>    <link rel='alternate' type='text/html' href='http://docs.google.com'/>    <link rel='http://schemas.google.com/g/2005#feed' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/spreadsheets/private/full'/>    <link rel='self' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/spreadsheets/private/full'/>    <openSearch:totalResults>2</openSearch:totalResults>    <openSearch:startIndex>1</openSearch:startIndex>    <entry>        <id>https://spreadsheets.google.com/feeds/spreadsheets/private/full/PORTFOLIO</id>        <updated>2015-01-01T19:09:11.326Z</updated>        <category scheme='http://schemas.google.com/spreadsheets/2006' term='http://schemas.google.com/spreadsheets/2006#spreadsheet'/>        <title type='text'>Portfolio</title>        <content type='text'>Portfolio</content>        <link rel='http://schemas.google.com/spreadsheets/2006#worksheetsfeed' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/worksheets/PORTFOLIO/private/full'/>        <link rel='alternate' type='text/html' href='https://docs.google.com/spreadsheets/d/PORTFOLIO/edit'/>        <link rel='self' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/spreadsheets/private/full/PORTFOLIO'/>        <author>            <name>name</name>            <email>email@mail.com</email>        </author>    </entry>    <entry>        <id>https://spreadsheets.google.com/feeds/spreadsheets/private/full/PORTFOLIO2</id>        <updated>2015-01-01T11:50:15.496Z</updated>        <category scheme='http://schemas.google.com/spreadsheets/2006' term='http://schemas.google.com/spreadsheets/2006#spreadsheet'/>        <title type='text'>Portfolio 2</title>        <content type='text'>Portfolio 2</content>        <link rel='http://schemas.google.com/spreadsheets/2006#worksheetsfeed' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/worksheets/PORTFOLIO2/private/full'/>        <link rel='alternate' type='text/html' href='https://docs.google.com/spreadsheets/d/PORTFOLIO2/edit'/>        <link rel='self' type='application/atom+xml' href='https://spreadsheets.google.com/feeds/spreadsheets/private/full/PORTFOLIO2'/>        <author>            <name>name</name>            <email>email@mail.com</email>        </author>    </entry></feed>";
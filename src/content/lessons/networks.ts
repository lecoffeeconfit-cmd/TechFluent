import {choice, fill, interview, order, type Lesson} from '../model';

export const networks: Lesson[] = [
  {
    id:'internet',group:'network',term:'Internet',title:'How does the internet work?',minutes:5,stage:'Foundational',prerequisites:[],related:['dns','http','api'],refs:['internet','http'],aliases:['IP','packets','router','client','server'],
    simple:'The internet connects networks. Your device can send small pieces of information across them to another computer and receive an answer.',
    technical:'IP addresses identify network interfaces. Routers forward packets toward a destination. On the web, application protocols such as HTTP give the exchanged messages meaning.',
    why:'A page can fail at several points between your phone and its server. Knowing the path helps you decide what to check first.',
    analogy:'Mail can travel through several sorting centers. Each center forwards the envelope toward its destination.',
    example:'Open a weather page. Your browser locates its server, sends a request, and uses the response to draw the forecast.',
    mistake:'A Wi-Fi icon tells you about the local wireless link. The router may still have lost its connection to the wider internet.',
    practice:'Compare a second site and a second device before blaming a particular service. Change one condition at a time.',
    tradeoff:'A nearby cached copy can shorten the trip, but a forecast in a cache may be older than the latest reading.',
    security:'HTTPS protects data in transit to the verified endpoint. A padlock alone cannot establish that a forecast is accurate.',diagram:'internet',
    checks:[
      choice('Which device forwards packets between networks?',['Router','Keyboard','Display'],0,'Think about the junction between two roads.','A router forwards packets toward the destination network.'),
      choice('A phone joins Wi-Fi. What have you established?',['Every website is reachable','The phone has a local wireless link','A weather server returned data'],1,'Which part of the trip has happened?','The local link can work even when the internet connection or a remote service fails.'),
      order('Trace a weather request from start to finish.',['The server returns a forecast','Your browser sends a request','The browser displays the forecast'],[1,0,2],'The page needs the forecast before it can display it.','The browser initiates the exchange, the server responds, and the browser renders the result.')
    ],
    interview:interview(['Walk me through opening a weather page.','The browser finds the server address, connects, requests the page, and renders its response. Routers forward packets along the path.'],['One site fails but other sites load. What do you compare?','Check the same site on another device, then separate name lookup, connection, and the HTTP result. Record which step differs.'],['How would you narrow a regional page-load delay?','Compare timing for lookup, connection, first byte, and download across regions. Use a common test resource and account for caching.'],['Trace the request and the reply.','Separate the local link from the remote service.','Choose an observation that narrows the failure.'])
  },
  {
    id:'dns',group:'network',term:'DNS',title:'How does a name become an address?',minutes:4,stage:'Foundational',prerequisites:['internet'],related:['http','monitoring'],refs:['dns','internet'],aliases:['Domain Name System','resolver','TTL','hostname'],
    simple:'DNS is a directory that lets a device look up information about a name, such as the address for a website.',
    technical:'A recursive resolver answers queries using cached records or by consulting other DNS servers. Address records include A for IPv4 and AAAA for IPv6. A time to live limits how long a cached answer may be reused.',
    why:'A server can be healthy while some visitors still resolve the site name to an old address.',
    analogy:'A saved contact lets you call by name. A saved number can briefly be out of date after a change.',
    example:'After a website moves, a resolver may keep the previous address until its cached record expires.',
    mistake:'DNS does not deliver the webpage. Locating an address is one part of making the request.',
    practice:'Plan DNS lifetimes before a migration and leave the old destination available during the change.',
    tradeoff:'Shorter lifetimes can speed changes but usually increase lookup traffic.',
    security:'Use managed access to DNS changes. An unauthorized edit can send visitors to the wrong destination.',diagram:'dns',
    checks:[choice('Which record maps a name to an IPv4 address?',['AAAA','A','TXT'],1,'IPv4 has the shorter record label.','An A record contains an IPv4 address. AAAA holds an IPv6 address.'),fill('Which three-letter field limits how long a DNS answer may stay cached?',['TTL','time to live'],'Think of a record’s lifetime.','The time to live bounds ordinary cache reuse.'),choice('A migration is complete, but one office still reaches the old server. What would you compare first?',['Screen sizes','The two resolvers’ answers and remaining TTLs','The file names in the page'],1,'The two offices may consult different caches.','Different cached DNS answers can lead clients to different destinations.')],
    interview:interview(['What problem does DNS solve?','It lets applications discover records for a name. One common use is finding the network address before connecting.'],['Why might two clients see different addresses after a change?','Their resolvers may have cached older answers at different times. Compare the answers, their remaining TTLs, and the authoritative record.'],['How would you plan a low-disruption DNS cutover?','Reduce the TTL ahead of the old expiry, keep both destinations healthy, observe traffic, and maintain a rollback window.'],['Name the information being looked up.','Explain who can cache the record.','Describe a migration risk and how to check it.'])
  },
  {
    id:'http',group:'network',term:'HTTP',title:'Read a request and its response',minutes:5,stage:'Foundational',prerequisites:['internet'],related:['api','auth','retry'],refs:['http','status'],aliases:['HTTPS','GET','status code','client-server'],
    simple:'HTTP gives a client and server a shared format for requests and replies. A reply includes a status code that describes the outcome.',
    technical:'A request includes a method and target, headers, and sometimes a body. A response carries a status, headers, and an optional body. Clients must interpret the status and the application’s contract.',
    why:'A response can arrive successfully over the network and still report that a requested resource is missing.',
    analogy:'A library request slip describes what you want. The reply can contain the book or explain why it is unavailable.',
    example:'GET /books/17 can receive 200 with a book, or 404 when the service has no visible book at that address.',
    mistake:'Treating every received response as success can leave a blank page when the response actually contains an error.',
    practice:'Handle expected error statuses separately and show a recovery action appropriate to the failure.',
    tradeoff:'Extra detail helps troubleshooting. Returning internal error details can reveal private implementation information.',
    security:'Use HTTPS for network requests carrying credentials, and keep sensitive details out of URLs and diagnostic logs.',diagram:'http',
    checks:[choice('Where does the client find the result classification?',['In the screen title','In the response status','In the Wi-Fi name'],1,'Look at the metadata in the reply.','The status code classifies the outcome.'),fill('Which HTTP method normally requests a representation without asking to change it?',['GET'],'It is a three-letter retrieval method.','GET requests a representation of the resource.'),choice('A book request returns 404. Which interface is appropriate?',['Display the book as saved','Retry forever','Show that the book is unavailable and offer a way back'],2,'The server has already answered.','404 indicates that the resource was not found or its existence was withheld. Repeated retries may add load without helping.')],
    interview:interview(['How do you distinguish an HTTP error from a lost connection?','With an HTTP error the client received an HTTP response and status. A connection failure may produce no HTTP response at all.'],['When would you show a retry action?','A temporary service failure might benefit from a limited retry. A missing resource usually needs a corrected link or another choice.'],['What would you measure if users see errors despite good connectivity?','Break down errors by endpoint and status class, correlate with server request IDs, and compare latency and traffic. Keep credentials out of logs.'],['Identify method, target, and status.','Distinguish transport failure from an error response.','Choose a recovery action that fits the outcome.'])
  },
  {
    id:'api',group:'backend',term:'API',title:'What is an API?',minutes:5,stage:'Foundational',prerequisites:['http'],related:['auth','retry','testing'],refs:['api','http'],aliases:['Application Programming Interface','endpoint','contract','integration','JSON'],
    simple:'An API is an agreement about how one piece of software can ask another to do something or provide information.',
    technical:'An application programming interface specifies available operations, accepted inputs, outputs, and error behavior. A web API may expose that contract over HTTP. Libraries and operating systems also expose APIs.',
    why:'Teams can change how a service works internally while keeping the agreement its clients rely on.',
    analogy:'A menu describes what a kitchen accepts as an order and what you can expect to receive.',
    example:'A weather app sends a city to a forecast endpoint. The server returns a temperature and its unit. The app can display the result without calculating the forecast.',
    mistake:'Assuming every response contains a temperature can lead to a crash when a city is unknown.',
    practice:'Define input limits, response fields, units, and error cases. Test a client against those cases before changing the contract.',
    tradeoff:'Adding an optional field can preserve older clients. Renaming a required field can break them and may call for a new API version.',
    security:'The service must check permission for the requested data. Treat credentials embedded in a public app as recoverable.',
    code:['Example HTTP exchange','GET /forecast?city=Lima\n\n200 OK\n{"temperature": 21, "unit": "C"}'],diagram:'api',
    checks:[choice('What is the main purpose of an API?',['Increase a device’s storage','Let software interact through a defined interface','Replace every database'],1,'Think about what two separate programs agree on.','An interface tells a caller which operations are available and how to use their results.'),choice('Which change is most likely to break an existing weather client?',['Returning a new optional field','Moving the server while keeping its address','Removing the required temperature field'],2,'Which change alters an existing promise?','Code that reads the required temperature field can fail when it disappears.'),order('Put the weather exchange in order.',['Read the unit and display the temperature','Send a city to the forecast endpoint','Check the response status and required fields'],[1,2,0],'Validate the response before using it.','Send the request, check its outcome and shape, then format the value for the user.')],
    interview:interview(['Explain an API using an example from an app.','A forecast API accepts a location and specifies how to read temperatures, units, and errors. The app knows the contract without knowing how the forecast was calculated.'],['What should happen if the service omits the unit?','If the unit is required, treat the reply as invalid, show a recoverable state, and record a non-sensitive diagnostic. Guessing a unit could show a misleading forecast.'],['How would you change a widely used API safely?','Find existing consumers, add compatible fields first, test old clients, document deprecation, and move incompatible behavior behind a new version.'],['Define the interface and caller.','Name an input, output, and failure case.','Explain how clients survive changes.'])
  },
  {
    id:'retry',group:'backend',term:'Idempotency',title:'When is it safe to retry?',minutes:6,stage:'Intermediate',prerequisites:['api'],related:['http','testing'],refs:['retry'],aliases:['idempotent','duplicate','idempotency key'],
    simple:'An operation is idempotent when repeating the same request has the same intended effect as making it once.',
    technical:'Idempotency concerns intended server state. Responses or logs can differ between attempts. A create operation can support safe replay through a documented idempotency key and atomic deduplication.',
    why:'A lost reply leaves a client unsure whether the server already carried out the operation.',
    analogy:'Setting a volume control to five twice still leaves it at five. Pressing “louder” twice changes it twice.',
    example:'A booking service stores a unique request key together with the reservation. A retry with the same key and input can recover the same result.',
    mistake:'Creating a fresh key on every retry defeats duplicate detection.',
    practice:'Bind the key to the caller and normalized request. Commit the effect and its deduplication record together.',
    tradeoff:'Keeping keys longer handles late retries but consumes storage and complicates retention.',
    security:'A key identifies an operation. The service still has to authorize the caller before releasing a previous result.',
    checks:[choice('Which operation is naturally idempotent?',['Add one seat','Set the seat count to two','Send a new reminder'],1,'Compare the effect after one call and two.','Setting the same absolute value has the same intended effect.'),choice('A timeout after creation means what?',['Creation definitely failed','Creation definitely succeeded','The client does not yet know the outcome'],2,'The reply could have been lost after the commit.','The server may already have committed the effect.'),choice('A client retries an identical reservation after a timeout. Which identifier should it send?',['The original operation key','A new random key','Another customer’s key'],0,'The server needs to recognize the same intent.','Reusing the original key allows atomic deduplication for that customer and request.')],
    interview:interview(['What makes an operation idempotent?','Repeating it has the same intended effect on state. Repeated GETs may still be logged.'],['How could a booking POST become safe to retry?','Reuse a caller-scoped key for the same booking intent. Persist its result with the booking and reject reuse with conflicting inputs.'],['What happens if two identical requests arrive together?','A uniqueness constraint and transaction must serialize creation of the effect. Wait for or recover the first result, and define an expiry policy.'],['Distinguish state effects from response equality.','Account for a lost reply.','Describe concurrent duplicates and key scope.'])
  }
];

if ( !PULSE ) { var PULSE = {}; }

/**
 * Constructor.
 */
PULSE.Carousel = function ( containerId, ui, config )
{
	this.container = document.getElementById( containerId );
	
	if ( this.container )
	{
		this.ui = ui;
		this.carouselElements = [];
		this.firstItem = 0;
		this.offset = 0;
		this.config = config;
		
		this.classLookup = { 'Worms' 				: 'worm',
			    			 'Wagon Wheel'      	: 'ww',
							 'Variable Bounce'  	: 'variable-bounce',
							 'Trajectory Viewer'	: 'trajectory',
			    			 'Speed Pitch Map'  	: 'speed-pitchmap',
			    			 'Pitch Map'        	: 'pitchmap',
			    			 'Pitch Map Mountain'	: 'pitchmap-mountain',
			    			 'Runs Per Over'    	: 'runs-per-over',
			    			 'Run Rate'         	: 'run-rate',
			    			 'Partnerships'			: 'partnership',
			    			 'Bowl Speeds'			: 'bowl-speeds',
			    			 'Beehive Placement'	: 'beehive' };
		
		
		var that = this;
		var prevLink = document.getElementById( 'carousel-scrolling-prev' );
		var nextLink = document.getElementById( 'carousel-scrolling-next' );
		
		$(prevLink).click( function() { that.go( '$prev' ); } );
		$(nextLink).click( function() { that.go( '$next' ); } );

		this.prevParent = prevLink.parentNode;
		this.nextParent = nextLink.parentNode;
	}		
};

/**
 * Sets the graphs displayed by this carousel.
 */
PULSE.Carousel.prototype.setGraphs = function ( graphs )
{
	this.carouselElements = [];
	if ( this.container )
	{
		// Remove all children
		while ( this.container.firstChild )
		{
			this.container.removeChild( this.container.firstChild )
		}
		
		// Create a UL container and attach it
		var ul = document.createElement( 'ul' );
		this.container.appendChild( ul );
	
		// Create listener
		var that = this;
		var listener = function ( ) { that.go( this ); };
		
		// For each graph, create an LI containing a div
		for ( var g = 0, glimit = graphs.length; g < glimit; g++ )
		{
			var graph = graphs[g];
			
			var clazz = this.classLookup[ graph ];
			var li = PULSE.NewUI.createElement( 'li', { 'class':clazz, className:clazz } );
			$(li).click( listener );

			ul.appendChild( li );
			
			this.carouselElements.push( li );
			
			var div = PULSE.NewUI.createElement( 'div', { 'class':'viewLabel', className:'viewLabel' } );
			div.innerHTML = graph;
			li.appendChild( div );
		}
		
		// Pages and remainder (items on last page)
	    this.pages = Math.ceil( graphs.length / this.config.itemsPerPage );
	    this.items = graphs.length;
	}
};

/**
 * Ensures the given graph (and none others) is highlighted in the carousel. 
 */
PULSE.Carousel.prototype.select = function ( item )
{
	// Set this item to active and all others to inactive
	for ( var i = 0, ilimit = this.carouselElements.length; i < ilimit; i++ )
	{
		var elem = this.carouselElements[i];
		var baseClass = elem.getAttribute( 'class' ).replace( / *active/, '' );

		if ( elem === item )
		{
			elem.setAttribute( 'class', baseClass + ' active' );
			elem.setAttribute( 'className', baseClass + ' active' );
			
			// Ensure we show the page it is on!
			if ( i < this.firstItem || i >= this.firstItem + this.config.itemsPerPage )
			{
				this.firstItem = i;
				this.normalise();
				this.show();
			}
		}
		else
		{
			elem.setAttribute( 'class', baseClass );
			elem.setAttribute( 'className', baseClass );
		}
	}
};

/**
 * Ensures the given graph (and none others) is highlighted in the carousel, by name. 
 */
PULSE.Carousel.prototype.selectByName = function ( name )
{
	// Set this item to active and all others to inactive
	for ( var i = 0, ilimit = this.carouselElements.length; i < ilimit; i++ )
	{
		var elem = this.carouselElements[i];
		if ( elem.firstChild.innerHTML === name )
		{
			this.select( elem );
			return;
		}
	}
};

/**
 * Fired when a carousel element is clicked.
 */
PULSE.Carousel.prototype.go = function ( item )
{
	if ( '$next' === item )
	{
		this.scroll( 1 );
	}
	else if ( '$prev' === item )
	{
		this.scroll( -1 );
	}
	else
	{
		this.select( item );

		var graphName = item.firstChild.innerHTML;
		this.ui.controller.setGraph( graphName );
		this.ui.controller.graphProvider.syncTo( graphName );
	}
};

/**
 * Normalises the firstItem value to ensure it is in range, and results in no blank spaces.
 * Also updates the prev/next styles to hide navigators that cannot be actioned.
 */
PULSE.Carousel.prototype.normalise = function ()
{
	// Check for overflow
	if ( this.firstItem >= this.items )
	{
		this.firstItem = this.items - 1;
	}

	// Need to check if we need to rewind a bit to ensure there are no blank spots
	if ( this.firstItem + this.config.itemsPerPage > this.items )
	{
		this.firstItem -= ( this.config.itemsPerPage - ( this.items % this.config.itemsPerPage ) ); 
	}

	// Check for underflow
	if ( this.firstItem < 0 )
	{
		this.firstItem = 0;
	}
	
	// Finally set styles for navigation parents
	this.prevParent.setAttribute( 'class', 'scrolling' + 
			( this.firstItem > 0  ? ' scrolling-prev' : '' ) );
	this.prevParent.setAttribute( 'className', 'scrolling' + 
            ( this.firstItem > 0  ? ' scrolling-prev' : '' ) );
	this.nextParent.setAttribute( 'class', 'scrolling' +
			( this.firstItem < this.items - this.config.itemsPerPage ? ' scrolling-next' : '' ) );
	this.nextParent.setAttribute( 'className', 'scrolling' +
            ( this.firstItem < this.items - this.config.itemsPerPage ? ' scrolling-next' : '' ) );
	
};

/**
 * Scrolls the carousel left or right by one page.
 * 
 * @param 1 or -1 for right and left scroll respectively
 */
PULSE.Carousel.prototype.scroll = function ( direction )
{
	// Increment/decrement firstItem pointer
	this.firstItem += ( this.config.itemsPerPage * direction );
	
	// Normalise the firstItem value
	this.normalise();
	
	// Show the firstItem value, attempting to do so at the left-most edge
	this.show();
};

/**
 * Show the firstItem element, preferably at the start of the carousel.
 */
PULSE.Carousel.prototype.show = function ()
{	
	// Obtain the new offset for the firstItem, and from that the delta
	var newOffset = this.config.itemSize * this.firstItem;
	var delta = this.offset - newOffset;
	
	// Animate!
	$('#carousel').animate( { left: '+=' + delta }, 'slow' );
	
	// Save new offset
	this.offset = newOffset;
};

/** Enforcement specifiers */
var FilterEnforcement = { ALL:0, SPECIFIC:1 };

/** Clear image */
var clearImg = 'images/graph_opacity_100.png';

if ( !PULSE ) { var PULSE = {}; }

PULSE.config = {};

PULSE.config.REGION_LOOKUP = { 
	'default': '../../backgrounds/cricket/cricinfo/default/',
	'india'  : '../../backgrounds/cricket/cricinfo/india/',
	'uk'     : '../../backgrounds/cricket/cricinfo/uk/'
};

PULSE.config.IMAGE_URL_PREFIX = PULSE.config.REGION_LOOKUP[ 'default' ];

PULSE.config.FF1 = 'Arial';
PULSE.config.FF2 = 'Verdana';

PULSE.config.SF03 = new OldProjection( 
		{ x : 5.71616086653962e+001,
		  y : -5.74508015852656e-002, 
		  z : 1.31300009460449e+001 },
        { r : 0.00100000004750,
          p : -1.77594492229400,
          y : 1.56978523244710 },
          1,
          4.71891308593750e+003,
	    { x : 315,
	      y : 177 } );

var configInit = function ()
{
	PULSE.config.wagonWheel = 
	{
		width      : 630,
		height     : 354,
		font       : new PULSE.Font( PULSE.config.FF1, 11, 'Bold' ),
		lineWidth  : 2,
		origin	   : { x: 228, y: 176 },
		scale	   : { x: 0.78, y: 0.7 },
		scaleback  : { length:100, amount:0.8 },
		transform  : function ( x, y, sign ) 
		{
			return { x: this.origin.x + ( sign * ( y * this.scale.x ) ), 
					 y: this.origin.y + ( sign * ( x * this.scale.y ) ) };
		},
		colors     : { 1:['rgba(255,224,11,0)',  'rgba(255,224,11,1)'], 
		               2:['rgba(255,255,255,0)', 'rgba(255,255,255,1)'], 
		               3:['rgba(255,255,255,0)', 'rgba(255,255,255,1)'],
		               4:['rgba(55,73,200,0)',   'rgba(55,73,200,1)'],
		               5:['rgba(55,73,200,0)',   'rgba(55,73,200,1)'],
		               6:['rgba(226,6,44,0)',    'rgba(226,6,44,1)'],
		               7:['rgba(226,6,44,0)',    'rgba(226,6,44,1)'] },
		key        : { x         : [ 443, 585 ], 
		               runs      : { label:'RUNS', 			y:16,  color:'#fff', lcolor:'#000' }, 
		               balls     : { label:'BALLS', 		y:36,  color:'#fff', lcolor:'#000' }, 
		               scoring   : { label:'SCORING BALLS', y:56,  color:'#fff', lcolor:'#000' }, 
		               runsleg   : { label:'RUNS LEG-SIDE',	y:76,  color:'#fff', lcolor:'#000' }, 
		               runsoff   : { label:'RUNS OFF-SIDE', y:96,  color:'#fff', lcolor:'#000' },
		 			   singles   : { label:'SINGLES',		y:140, color:'#fff', lcolor:'#000' }, 
		 			   twothrees : { label:'2s AND 3s',     y:160, color:'#fff', lcolor:'#000' }, 
		 			   fours     : { label:'FOURS', 		y:180, color:'#fff', lcolor:'#000' }, 
		 			   sixes     : { label:'SIXES', 		y:200, color:'#fff', lcolor:'#000' } },
		freetext : { 
			font		: new PULSE.Font( PULSE.config.FF2, 12 ), 
			spacing		: 5, 
			background	: { color:'#000', opacity:0.75 },
			position	: { x:595, y:349, anchor:'se' },
			margin		: { top:3, left:8, bottom:8, right:8 },
			text        : 'Hover over run categories to see only those runs' 
		},
						
		keyLabelLeftLimit	:	436,
		keyLabelRightLimit	:	590,
		keyLabelTopLimit	:	130,
		keyLabelBottomLimit	:	210,
		keyLabelWidth		:	20,
		
		keyDisplayMode	:	'labelsandvalues'
	};
	
	PULSE.config.pmTooltip = 
	{ 
		font		: new PULSE.Font( PULSE.config.FF2, 10, 'Bold' ), 
		spacing		: 3,
		border      : { width:2, color:'#fff', opacity:0.8, indicator:14 },
		background	: { color:'#000', opacity:0.75 },
		margin		: { top:5, left:8, bottom:8, right:10 }
	};
	
	PULSE.config.pitchMap =
	{
		width      : 630,
		height	   : 354,
	    projection : PULSE.config.SF03,
		ballSize   : '8px',
		variants   : 
			{ rh   : { background 	: 'images/SF03-pitchmap-RH.jpg',
					   offset       : -157.5 },
			  lh   : { background 	: 'images/SF03-pitchmap-LH.jpg',
					   offset       : 157.5 },
			  mix  : { background 	: 'images/SF03-pitchmap-split.jpg' } },
		colors     : { w:'white',
					   0:'red',
					   1:'blue', 2:'blue', 3:'blue',
					   4:'yellow', 5:'yellow', 6:'yellow', 7:'yellow' },
		tooltip	   : PULSE.config.pmTooltip 
	};
	
	PULSE.config.variableBounce =
	{
		width      : 630,
		height	   : 354,
	    projection : PULSE.config.SF03,
		ballSize   : '8px',
		variants   : 
			{ rh   : { background 	: 'images/SF03-variable-bounce-RH.jpg',
				       offset       : -157.5 },
			  lh   : { background 	: 'images/SF03-variable-bounce-LH.jpg',
					   offset       : 157.5 },
			  mix  : { background 	: 'images/SF03-variable-bounce-split.jpg' } },
		colors     : { w:'white',
					   a:'red',
					   s:'blue' },
		tooltip	   : PULSE.config.pmTooltip 
	};
	
	PULSE.config.speedPitchMap =
	{
		width      : 630,
		height	   : 354,
	    projection : PULSE.config.SF03,
		ballSize   : '8px',
		variants   : 
			{ rh   : { background 	: 'images/SF03-speed-pitchmap-RH.jpg',
			   		   offset       : -157.5 },
			  lh   : { background 	: 'images/SF03-speed-pitchmap-LH.jpg',
					   offset       : 157.5 },
			  mix  : { background 	: 'images/SF03-speed-pitchmap-split.jpg' } },
		buckets    : [ 55, 80, 85 ],
		colors     : { 0:'blue',
					   1:'yellow', 
					   2:'orange', 
					   3:'red' },
		tooltip	   : PULSE.config.pmTooltip 
	};
	
	PULSE.config.pitchMapMountain =
	{
		width      : 630,
		height	   : 354,
		projection : new OldProjection( { x : 2.65430542697524e+001,
									      y : 6.42045784603685e+000,
									      z : 6.95600094604488e+000 },
				   				        { r : 0.00100000004750,
				   				          p : -1.80349481105804,
				   				          y : 1.79723524325040 },
				   				          1,
				   				          2.01462267253574e+003,
								        { x : 315,
								          y : 177 } ),
		boundary   : { x : { min:-1, max:15 }, y : { min:-2.5, max:2.5 } },						       
		bucketSize : 0.1,
		light      : { x : 0.85998, y : 0.35092, z : 0.28127 },
		color      : { r : 1.0, g : 0.13, b : 0.13 },
		lightStrength: 0.7,
		maxHeight  : 1.5
	};
	
	PULSE.config.trajViewer =
	{
		width       : 630,
		height	    : 354,
		enforcement : { innings:FilterEnforcement.SPECIFIC,
						batsman:FilterEnforcement.ALL },
		speed       : 0.5,
		shadowStyle : '#000',
		shadowOpacity : 0.3,
		trailColors : [ 'rgb( 255, 25, 25 )', 'rgb( 51, 51,229 )', 'rgb( 255,255,25 )',
		                'rgb( 242,242,242 )', 'rgb( 76,255, 76 )', 'rgb( 255,127, 0 )', 
		                'rgb(  71,178,211 )', 'rgb(  0,  0,  0 )' ],
		trailOpacity : 0.5,
		maxBalls    : 12,
		timeMargin  : { start:0.2, end:0.8 },
		interval    : 0.016,
		refresh     : 16,
		releaseX    : 18.5,
		views       : [	{
			background : 'images/CF06-behind-stumps.jpg',
			mask       : 'images/CF06-behind-stumps-stumps.png',
			projection : new OldProjection( { x : -1.30340641314540e+001,
										      y : 6.55780774160179e-004, 
										      z : 1.01519555854797e+000 },
					   				        { r : 0.00000000000000,
					   				          p : -1.69455480575562,
					   				          y : -1.57098985150575 },
									          1,
									          7.06948199903051e+002,
									        { x : 315,
									          y : 177 } ),
		    ordering   : 'serial',
			ballSize   : { max:7, min:2 }
		},{
			background : 'images/SF02-slips-view.jpg',
			mask       : 'images/SF02-slips-view-stumps.png',
			projection : new OldProjection( { x : -1.52046166560366e+001,
										      y : -2.45856293149031e+000,
										      z : 1.27394558906555e+000 },
					   				        { r : 0.00000000000000,
					   				          p : -1.66230483929394,
					   				          y : -1.32438983979288 },
									          1,
									          7.84686523437500e+002,
									        { x : 315,
									          y : 177 } ),
		    ordering   : 'serial',
			ballSize   : { max:6, min:2 }
		},{
			background : 'images/CF08-bowler-view.jpg',
			mask       : clearImg,
			projection : new OldProjection( { x : 1.56122201708035e+001,
										      y : 2.27388662660465e-002,
										      z : 1.73519555854797e+000 },
					   				        { r : 0.00000000000000,
					   				          p : -1.65570485591888,
					   				          y : 1.56976029767187 },
									          1,
									          1.90611916909261e+003,
									        { x : 315,
									          y : 177 } ),
		    ordering   : 'serial',
			ballSize   : { max:3, min:7 }
		} ]
	};
	
	PULSE.config.beehive =
	{
		width      : 630,
		height	   : 354,
		projection : new OldProjection( { x : 2.35950056480387e+000, 
									      y : 3.91204298232273e-002, 
									      z : 1.13519555854797e+000 }, 
					   				    { r : 0.00000000000000,
									      p : -1.59240460395813, 
									      y : 1.54906029668867 },
									      1,
									      1.21635915977444e+003,
									    { x : 315,
									      y : 177 } ),
		ballSize   : '12px',
		variants   : 
	    	{ rh   : { background 	: 'images/CF05_Beehive_RH.jpg' },
		   	  lh   : { background 	: 'images/CF05_Beehive_LH.jpg' },
		   	  mix  : { background 	: 'images/CF05_Beehive_RH.jpg' } },
		colors     : { w: 'white',
					   d: 'red',
					   o: 'blue',
					   ob:'cyan',
					   l: 'yellow',
					   lb:'orange' }
	};
	
	PULSE.config.bowlSpeeds = 
	{
		width  		: 630,
		height 		: 354,
		boxWhisker  : false,
		font   		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
		enforcement	: { innings:FilterEnforcement.SPECIFIC },
		keyMargin 	: 10,
		keyMarginR  : 40,
		keyFill 	: { color:'#000', opacity:0.3 },
		colors 		: [ '#FF3F3F','#E6DF1B','#3CE61B','#E65E1B','#007EFF','#1BD5D2','#B0B0B0','#FFFFFF' ],
		xAxis  		: new PULSE.RaphaelAxis( 'Ball',         0,20,  90,430,300, 8, { 0:'' } ),
		yAxis  		: new PULSE.RaphaelAxis( 'Speed (mph)', 40,100, 300,40,90, 6, { 40:'-40', 100:'100+' }, undefined, undefined, 5 )
	};
	
	PULSE.config.partnerships =
	{
		width 		: 630,
		height	 	: 354,
		enforcement : { innings:FilterEnforcement.SPECIFIC,
						batsman:FilterEnforcement.ALL,
						bowler :FilterEnforcement.ALL },
		ystart	 	: 42,
		yspacing 	: 30,
		pshipText 	: { font:new PULSE.Font( PULSE.config.FF1, 16, 'Bold' ), style:'#ff0' },
		otherText 	: { font:new PULSE.Font( PULSE.config.FF1, 14 ), style:'#fff' },
		bars		: { yshift:0, width:20, colorStops:[ '#f00', '#800' ], minLength:10, maxLength:120 },
		tabs		: [ 170, 166, 26 ]
	};
	
	PULSE.config.runsPerOver =
	{
		width 		: 630,
		height	 	: 354,
		enforcement : { innings:FilterEnforcement.SPECIFIC,
						batsman:FilterEnforcement.ALL,
						bowler :FilterEnforcement.ALL },
		fow			: { stroke:'#000', fill:'#f00' },
		font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
		variants	: { 
			t20:
			{
				bars  : { width:18, colorStops:[ '#ff0', '#fff' ], fowsize:12 },
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,20,  90,570,300, 11, { 0:'' }, 1, -8 ),
				yAxis : new PULSE.RaphaelNonLinearAxis( 'Runs per over', 0,16, 300,40,90, 8,
						[ [0,0], [4,1/6], [12,5/6], [16,1] ],
						{ 16:'16+', 2:'', 14:'' } )
			},
			odi:
			{
				bars  : { width:8, colorStops:[ '#ff0', '#fff' ], fowsize:8 },
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,50, 90,570,300, 5, { 0:'' }, 1, -3 ),
				yAxis : new PULSE.RaphaelNonLinearAxis( 'Runs per over', 0,12, 300,40,90, 4,
						[ [0,0], [3,1/6], [9,5/6], [12,1] ],
						{ 12:'12+' } )
			}
		},
		tooltip	   : PULSE.config.pmTooltip 
	};
	
	PULSE.config.flexikey = 
	{ 
		font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ), 
		spacing		: 5, 
		background	: { color:'#000', opacity:0.3 },
		position	: { x:585, y:15, anchor:'ne' },
		margin		: { top:6, left:8, bottom:9, right:10 },
		swatch		: { size:8, spacing:6 }
	};
	
	PULSE.config.runRate =
	{
		width 		: 630,
		height	 	: 354,
		enforcement : { innings:FilterEnforcement.ALL,
						batsman:FilterEnforcement.ALL,
						bowler :FilterEnforcement.ALL },
		fow			: { stroke:'black', size:8 },
		font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
		flexikey    : PULSE.config.flexikey,
		variants	: { 
			t20:
			{
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,20,  90,570,300, 10, { 0:'' }, 1, -8 ),
				yAxis : new PULSE.RaphaelNonLinearAxis( 'Run Rate', 0,16, 300,80,90, 8,
						[ [0,0], [4,1/6], [12,5/6], [16,1] ],
						{ 16:'16+', 2:'', 14:'' } )
			},
			odi:
			{
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,50, 90,570,300, 10, { 0:'' }, 1, -3 ),
				yAxis : new PULSE.RaphaelNonLinearAxis( 'Run Rate', 0,10, 300,80,90, 10,
						[ [0,0], [3,1/6], [7,5/6], [10,1] ],
						{ 10:'10+', 1:'', 2:'', 8:'', 9:'' } )
			},
			test:
			{
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,20, 90,570,300, 10, { 0:'' } ),
				yAxis : new PULSE.RaphaelAxis( 'Run Rate', 0,6, 300,80,90, 6, { 6:'6+' } )
			}
		},
		textField : { 
			font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ), 
			spacing		: 3, 
			background	: { color:'#000', opacity:0.3 },
			position	: { x:45, y:15, anchor:'nw' },
			margin		: { top:3, left:6, bottom:4, right:8 }
		}
	};
	
	PULSE.config.worms =
	{
		width 		: 630,
		height	 	: 354,
		enforcement : { innings:FilterEnforcement.ALL,
						batsman:FilterEnforcement.ALL,
						bowler :FilterEnforcement.ALL },
		fow			: { stroke:'black', size:8 },
		font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
		flexikey    : PULSE.config.flexikey,
		variants	: { 
			t20:
			{
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,20,  90,570,300, 10, { 0:'' }, 1, -8 ),
				yAxis : new PULSE.RaphaelAxis( 'Runs', 0,250, 300,80,90, 5, undefined, undefined, undefined, 10 )
			},
			odi:
			{
				xAxis : new PULSE.RaphaelAxis( 'Overs', 0,50, 90,570,300, 5, { 0:'' }, 1, -3 ),
				yAxis : new PULSE.RaphaelAxis( 'Runs', 0,350, 300,80,90, 7, undefined, undefined, undefined, 10 )
			}
		},
		textField : { 
			font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ), 
			spacing		: 3, 
			background	: { color:'#000', opacity:0.3 },
			position	: { x:45, y:15, anchor:'nw' },
			margin		: { top:3, left:6, bottom:4, right:8 }
		}
	};
	
	PULSE.config.winLikelihood = 
	{
		width  	  : 630,
		height 	  : 354,
		enforcement : { innings:FilterEnforcement.ALL,
						batsman:FilterEnforcement.ALL,
						bowler :FilterEnforcement.ALL },
		flexikey  : PULSE.config.flexikey,
		font	  : new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
		fow		  : { stroke:'black', size:8 },
		drawColor : '#aaa',
		xAxis     : new PULSE.RaphaelAxis( 'Match Progress',  0,20,  90,570,300, 0, { 0:'' } ),
		yAxis  	  : new PULSE.RaphaelAxis( 'Win Likelihood %', 0,100, 300,70,90, 5 ),
		tooltips  : { background : { color:'#000', opacity:0.5 },
					  foreground :'#fff',
					  font       : new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ),
					  height     : 20,
					  border     : { left:6, right:5 } },
		dismissalTextField : { 
			font		: new PULSE.Font( PULSE.config.FF2, 12, 'Bold' ), 
			spacing		: 5, 
			background	: { color:'#000', opacity:0.3 },
			position	: { x:45, y:15, anchor:'nw' },
			margin		: { top:5, left:8, bottom:10, right:8 }
		}
	}
};

var graphs;
var graphInit = function ()
{
	configInit();
	graphs = 
	{
	 	'Wagon Wheel' 		 : new Graph( 'images/WW.jpg', clearImg, 
	 			     		   new PULSE.RaphaelWagonWheelRenderer( PULSE.config.wagonWheel ) ),
	 	'Pitch Map' 		 : new Graph( 'images/SF03-pitchmap-RH.jpg', clearImg, 
	 				 		   new PULSE.RaphaelPitchMapRenderer( PULSE.config.pitchMap ) ),
	 	'Speed Pitch Map' 	 : new Graph( 'images/SF03-speed-pitchmap-RH.jpg', clearImg, 
	 			     		   new PULSE.RaphaelSpeedPitchMapRenderer( PULSE.config.speedPitchMap ) ),
	 	'Pitch Map Mountain' : new Graph( 'images/SF04-mountain.jpg', clearImg, 
	 			     		   new PULSE.RaphaelPitchMapMountainRenderer( PULSE.config.pitchMapMountain ) ),
	 	'Trajectory Viewer'  : new Graph( 'images/CF06-behind-stumps.jpg', clearImg, 
	 			     		   new PULSE.RaphaelTrajectoryRenderer( PULSE.config.trajViewer ) ), 
		'Beehive Placement'  : new Graph( 'images/CF05_Beehive_RH.jpg', clearImg, 
				     		   new PULSE.RaphaelBeehiveRenderer( PULSE.config.beehive ) ),
		'Variable Bounce'    : new Graph( 'images/SF03-variable-bounce-RH.jpg', clearImg, 
					 		   new PULSE.RaphaelVariableBounceRenderer( PULSE.config.variableBounce ) ),
		'Bowl Speeds' 		 : new Graph( 'images/bg-2.jpg', clearImg, 
							   new PULSE.RaphaelBowlSpeedsRenderer( PULSE.config.bowlSpeeds ) ),
		'Partnerships' 		 : new Graph( 'images/bg-2.jpg', clearImg, 
							   new PULSE.RaphaelPartnershipsRenderer( PULSE.config.partnerships ) ),
		'Runs Per Over' 	 : new Graph( 'images/bg-2.jpg', clearImg, 
							   new PULSE.RaphaelRunsPerOverRenderer( PULSE.config.runsPerOver ) ),
		'Run Rate' 			 : new Graph( 'images/bg-2.jpg', clearImg, 
				 			   new PULSE.RaphaelRunRateRenderer( PULSE.config.runRate ) ),
		'Worms' 			 : new Graph( 'images/bg-2.jpg', clearImg, 
							   new PULSE.RaphaelWormsRenderer( PULSE.config.worms ) )
	}
};
// Create the namespace if it doesn't already exist
if ( !PULSE ) { var PULSE = {}; }

/**
 * Constructor.
 */
PULSE.GraphController = function ( ui, db ) 
{
	this.ui = ui;
	this.db = db;
	this.graphProvider = new PULSE.GraphProvider();

	var that = this;
	$(ui.placeholderDiv).mousemove( function( event ) { that.onMouse( event ); } );
	$(ui.placeholderDiv).mousedown( function( event ) { that.onMouse( event ); } );
	$(ui.placeholderDiv).mouseup( function( event ) { that.onMouse( event ); } );
	ui.controller = this;
	
	this.data = [];
	this.rawData = {};
	this.filter = {};
	this.graph = null;
	this.lastGraphName = null;
	this.isTraj = false;

	// Set the graph to the first graph
	this.setGraph( this.graphProvider.current() );
	this.ui.setAvailableGraphs( this.graphProvider.getAvailableGraphs() );
};

/**
 * Derives the filter to be used, based upon the graph being displayed.
 */
PULSE.GraphController.prototype.deriveFilter = function ()
{
	var derivedFilter = {};
	
	// Apply enforcements
	var enf = this.getEnforcements();
	PULSE.Tracer.info( 'Enforcements: ' + Utils.toString( enf, true ) );
	
	var fields = [ 'innings', 'batsman', 'bowler' ];
	for ( var i = 0, j = fields.length; i < j; i++ )
	{
		if ( enf === undefined || enf[ fields[i] ] !== FilterEnforcement.ALL )
		{
			derivedFilter[ fields[i] ] = this.filter[ fields[i] ]; 
		}
	}
	
	// Handle traj viewer specialities
	if ( this.isTraj )
	{
		var bp;
		
		// Handle the 'Watch live' ball filter first, as this overrides all other filters
		if ( CricketFilter.WATCHLIVE === this.filter.over )
		{
			var lastTraj = this.db.getLastKeys().traj;
			if ( lastTraj !== undefined )
			{
				bp = new PULSE.BallProgress( lastTraj );
				derivedFilter = { innings:bp.innings, over:bp.over };
			}
		}
		// Also handle an over selector looking like 'i.o'
		else if ( !Utils.isNullish( this.filter.over ) )
		{
			if ( typeof this.filter.over === 'number' && !Utils.isNullish( this.filter.innings ) )
			{
				// This is after a restart, so rebuild the over filter
				this.filter.over = this.filter.innings + '.' + this.filter.over;
			}
			
			if ( this.filter.over.indexOf( '.' ) !== -1 ) 
			{
				// Specific over; parse into innings and over
				bp = new PULSE.BallProgress( this.filter.over );
				
				derivedFilter.innings = +bp.innings;
				derivedFilter.over = +bp.over;
			}	
		}
		
		derivedFilter.ball = this.filter.ball;
	}
	
	return derivedFilter;
};

/**
 * Derives the filtered data set from the current raw data and the current filter, and returns it.
 */
PULSE.GraphController.prototype.deriveData = function ()
{
	var derived = [];
	var rawSize = 0;

	var thisFilter = this.deriveFilter();
	PULSE.Tracer.info( 'Derived filter: ' + Utils.toString( thisFilter, true ) );
	
	for ( var key in this.rawData )
	{
		if ( this.rawData.hasOwnProperty( key ) )
		{
			rawSize++;
			var item = this.rawData[ key ];
		
			// Check for filter compliance
			if ( item.satisfiesFilter( thisFilter ) )
			{
				derived.push( item );
			}
		}
	}
	
	PULSE.Tracer.info( 'Raw data: ' + rawSize + ', derived data: ' + derived.length );

	// Set the placeholder class
	if ( rawSize === 0 )
	{
		this.ui.setPlaceholderState( PULSE.PlaceholderState.NODATA );
	}
	else if ( derived.length === 0 )
	{
		this.ui.setPlaceholderState( PULSE.PlaceholderState.NOFILTEREDDATA );
	}
	else
	{
		this.ui.setPlaceholderState( PULSE.PlaceholderState.DATA );
	}
	
	return derived;
};

/**
 * Changes the view of the current graph, if it supports views.
 */
PULSE.GraphController.prototype.setView = function ( view )
{
	if ( this.graph !== null && typeof this.graph.renderer.setView === 'function' )
	{
		this.graph.renderer.setView( view );
		this.ui.setMenuExpanded( false );
	}
};

/**
 * Resets all filters to their default values.
 */
PULSE.GraphController.prototype.reset = function ()
{
	this.setFilter( { over:CricketFilter.WATCHLIVE }, true );
	this.ui.setMenuExpanded( false );
};

/**
 * Gets the filter enforcements for the currently-selected graph.
 */
PULSE.GraphController.prototype.getEnforcements = function ()
{
	if ( this.graph !== undefined && this.graph.renderer.config !== undefined )
	{
		return this.graph.renderer.config.enforcement;
	}
};

/**
 * Sets the raw data, re-derives the filtered set and sets it.
 */
PULSE.GraphController.prototype.setRawData = function ( rawData )
{
	this.rawData = rawData;
	this.setData( this.deriveData() );
};

/**
 * Sets the filter, re-derives the filtered set and sets it.
 * 
 * @param filter the filter to set
 * @param sync (optional) if true, then ensures the UI is in sync; this is only needed when
 *        we are setting the graph via an API call 
 * @param ignoreInnings (optional) if true, then remove innings filter from syncFilter
 */
PULSE.GraphController.prototype.setFilter = function ( filter, sync, ignoreInnings )
{
	PULSE.Tracer.info( 'setFilter: ' + Utils.toString( filter, true ) );
	
	this.filter = filter;
	
	// If need be, convert the innings filter to an innings number
	if ( filter.innings !== undefined && filter.innings !== CricketFilter.ALL && isNaN( +filter.innings ) )
	{
		this.filter.innings = this.db.getInningsFromString( filter.innings );
		PULSE.Tracer.info( 'Innings name ' + filter.innings + ' derived number ' + this.filter.innings );
	}
	var inningsNumber = +this.filter.innings;

	// Ensure the UI matches the filter we have set, if we have been asked to do so
	if ( sync === true )
	{
		var syncFilter = Utils.cloneObject( this.filter );
		
		// We need to perform a Levenshtein match on batsman, bowler and innings
		var options = this.db.getOptions();
		
		var ba = filter.batsman;
		if ( ba !== undefined && ba !== CricketFilter.ALL )
		{
			if ( ba !== CricketFilter.LEFTHANDERS && ba !== CricketFilter.RIGHTHANDERS )
			{
				var batsmen = Utils.keyArray( options.batsman );
				syncFilter.batsman = PULSE.Levenshtein.bestMatch( batsmen, ba );
				this.filter.batsman = syncFilter.batsman; 
			}
		}
		else
		{
			syncFilter.batsman = CricketFilter.ALL;
			this.filter.batsman = CricketFilter.ALL;
		}
		
		var bo = filter.bowler;
		if ( bo !== undefined && bo !== CricketFilter.ALL )
		{
			if ( bo !== CricketFilter.SPINBOWLERS && bo !== CricketFilter.SEAMBOWLERS )
			{
				var bowlers = Utils.keyArray( options.bowler );
				syncFilter.bowler = PULSE.Levenshtein.bestMatch( bowlers, bo );
				this.filter.bowler = syncFilter.bowler;
			}
		}
		else
		{
			syncFilter.bowler = CricketFilter.ALL;
			this.filter.bowler = CricketFilter.ALL;
		}
		
		var inn = filter.innings;
		if ( inn !== undefined && inn !== CricketFilter.ALL )
		{
			if ( isNaN( +filter.innings ) )
			{
				var innings = Utils.keyArray( options.innings );
				syncFilter.innings = PULSE.Levenshtein.bestMatch( innings, inn );
				this.filter.innings = this.db.getInningsFromString( syncFilter.innings );
			}
			else
			{
				syncFilter.innings = this.db.getInningsString( inningsNumber );
			}
		}
		else
		{
			// Set the innings filter to All, only if it is allowed
			var enf = this.getEnforcements();
			if ( enf === undefined || enf.innings !== FilterEnforcement.SPECIFIC )
			{
				syncFilter.innings = CricketFilter.ALL;
				this.filter.innings = CricketFilter.ALL;
			}
			else
			{
				this.filter.innings = this.db.getInningsFromString( this.ui.getSelectorValues().innings );
				syncFilter.innings = this.filter.innings;
			}
		}
		
		if ( this.filter.over !== undefined && this.filter.over !== CricketFilter.WATCHLIVE )
		{
			// Munge into innings/over
			this.filter.over = inningsNumber + '.' + this.filter.over;
			syncFilter.over = this.filter.over;
			this.ui.updateBallSelector( this.filter.over );
		}
		
		if ( ignoreInnings )
		{
			syncFilter.innings = null;
		}
		
		this.ui.syncToFilter( syncFilter );
	}
	
	this.updateInfo();
	this.setData( this.deriveData(), true );
};

/**
 * Sets the data to be displayed by the graph. Should not be called externally.
 */
PULSE.GraphController.prototype.setData = function ( data, immediateRender )
{
	this.data = data;

	if ( this.graph !== null )
	{
		this.render( immediateRender );
	}
};

/**
 * Sets the background.
 */
PULSE.GraphController.prototype.setBackground = function ( path )
{
	var img = new Image();
	if ( !Utils.isNullish( path ) )
	{
		img.src = PULSE.config.IMAGE_URL_PREFIX + path;
	}
	PULSE.GraphController.setContent( this.ui.backgroundDiv, img );
};

/**
 * Sets the mask.
 */
PULSE.GraphController.prototype.setMask = function ( path )
{
	var img = new Image();
	if ( !Utils.isNullish( path ) )
	{
		img.src = PULSE.config.IMAGE_URL_PREFIX + path;
	}
	PULSE.GraphController.setContent( this.ui.overlayDiv, img );
};

/**
 * Selects the next graph.
 */
PULSE.GraphController.prototype.nextGraph = function ()
{
	var g = this.graphProvider.next();
	this.setGraph( g );
};

/**
 * Selects the previous graph.
 */
PULSE.GraphController.prototype.previousGraph = function ()
{
	var g = this.graphProvider.previous();
	this.setGraph( g );
};

/**
 * External access to graphing: showGraph.
 */
PULSE.GraphController.prototype.showGraph = function ( feature, innings, batsman, bowler )
{
	// Peform Levenshtein matching on graph name
	var graphList = this.graphProvider.getAvailableGraphs();
	var name = PULSE.Levenshtein.bestMatch( graphList, feature );
	if ( !Utils.isNullish( name ) )
	{
		this.setGraph( name );
		this.graphProvider.syncTo( name );
	}
	
	// Build the filter
	var filter = {};
	if ( !Utils.isNullish( innings ) )
	{
		filter.innings = innings;
	}
	if ( !Utils.isNullish( batsman ) )
	{
		filter.batsman = batsman;
	}
	if ( !Utils.isNullish( bowler ) )
	{
		filter.bowler = bowler;
	}
	
	// Apply the filter
	this.setFilter( filter, true );
};

/**
 * External access to graphing: showGame.
 */
PULSE.GraphController.prototype.showGame = function ( game, customer )
{
	this.db.loadGame( game, customer );
	this.reset();
};

/**
 * External access to graphing: showTrajectory.
 */
PULSE.GraphController.prototype.showTrajectory = function ( bpString )
{		
	var bp;
	if ( bpString.match( /[0-9]+\.[0-9]+\.All/ ) )
	{
		bp = new PULSE.BallProgress( bpString.replace( /All/, '0' ) );
	}
	else
	{
		bp = new PULSE.BallProgress( bpString );
	}

	// Select the innings as the first pass, to ensure other drop-downs have correct content
	this.ui.selectors.innings.setSelectedValue( this.db.getInningsString( bp.innings ) );
	this.ui.callback( 'inningsSelect' );
	
	// Now apply rest of filter
	var filter = { innings:bp.innings, over:bp.over };
	if ( bp.ball != 0 )	// Allow coercion
	{
		filter.ball = bp.ball;
	}
	else
	{
		filter.ball = CricketFilter.ALL;
	}
	
	this.setFilter( filter, true, false );
	this.setGraph( 'Trajectory Viewer' );
	this.ui.setShowSelector( 'ball', true );
	
	this.graphProvider.syncTo( 'Trajectory Viewer' );
};

/**
 * External access to graphing: setActive.
 */
PULSE.GraphController.prototype.setActive = function ( value )
{
	// Suspend/resume the downloading of data
	this.db.setActive( value );
	
	if ( !value )
	{
		// Unset the graph; this should stop any animation timers
		this.setGraph( null );
	}
	else
	{
		// Set the graph to what it was when it was last set
		this.setGraph( this.lastGraphName );
	}
};

/**
 * STATIC setInfo method.
 */
PULSE.GraphController.setInfo = function ( infoText, traj )
{
	var td = document.getElementById( 'traj-description' );
	var gi = document.getElementById( 'graph-info' ); 
	
	var info = traj ? td : gi;
	if ( info !== null )
	{
		info.innerHTML = infoText;
	}

	// Reset visibility of traj description
	PULSE.GraphController.setShowTrajDescription( traj );
	
	// Add disclaimer if we are viewing traj
	if ( traj )
	{
		gi.innerHTML = '<span>This application provides a close but not exact ' + 
					   'representation of the Hawk-Eye trajectory<span>';
	}
};

PULSE.GraphController.setGraphInfo = function ( graphName )
{
	var info = document.getElementById( 'current-graph' );
	if ( info !== null )
	{
		info.innerHTML = graphName;
	}
};

PULSE.GraphController.setShowTrajDescription = function ( show )
{
	var desc = document.getElementById( 'traj-description' );
	if ( desc !== null )
	{
		var c = 'trajDescription';
		if ( !show )
		{
			c += ' turnedOff';
		}
		desc.setAttribute( 'class', c );
		desc.setAttribute( 'className', c );
	}
};

PULSE.GraphController.prototype.setGraph = function ( name )
{
	PULSE.Tracer.info( 'Setting graph to ' + name );

	this.ui.setMenuExpanded( false );
	
	// Unrender current graph
	if ( this.graph !== null )
	{
		if ( this.graph.renderer !== null && typeof this.graph.renderer.unrender === 'function' )
		{
			this.graph.renderer.unrender();
		}
	}

	if ( !Utils.isNullish( name ) )
	{
		this.lastGraphName = name;
		PULSE.GraphController.setGraphInfo( name );
		
		var g = graphs[ name ];
		if ( g !== undefined && g !== null )
		{
			// Call tracker, if we can
			if ( PULSE.onGraphSelection )
			{
				PULSE.onGraphSelection( name );
			}
			
			// Save graph
			this.graph = g;
			this.isTraj = 'Trajectory Viewer' === name;

			if ( this.isTraj )
			{
				g.renderer.nextIndex = -1;
			}
			else
			{
				PULSE.GraphController.setInfo( '&nbsp;' );
			}
			
			// Apply enforcements from this graph
			this.ui.setEnforcement( this.getEnforcements() );
			
			if ( this.graph !== null )
			{
				// We need to re-derive data, as the derived filter may have changed
				this.setData( this.deriveData() );
				//this.render();
			}
			
			// Update variable visibility components
			var overSelection;
			var overSelector = this.ui.getSelectorById( 'overSelect' );
			if ( overSelector.selected )
			{
				overSelection = overSelector.value;
			}
			
			// Enforcement determines display of innings, batsman and bowler selectors
			var ss = this.getFilterShowState();
			for ( var property in ss )
			{
				if ( property !== 'reset' )
				{
					this.ui.setShowSelector( property, ss[property], this.isTraj );
				}
			}

			this.ui.setActiveMenuItem( name );
			this.ui.carousel.selectByName( name );
			
			this.ui.setShowViewNavigation( this.isTraj );
			this.ui.setShow( 'reset', ss.reset );
			this.ui.setShowSelector( 'over', this.isTraj );
			this.ui.setShowSelector( 'ball', this.isTraj &&
					( !Utils.isNullish( overSelection ) && overSelection.indexOf( '.' ) !== -1 ) );
		}
		else
		{
			PULSE.Tracer.error( 'Undefined graph' );
		}
	}
	
	// Update the info bar
	this.updateInfo();
};

/**
 * Updates the info bar with the current graph and derived filter, unless the current graph
 * is the trajectory viewer in which case the renderer takes care of the info bar.
 */
PULSE.GraphController.prototype.updateInfo = function ()
{
	if ( !this.isTraj )
	{
		// Build the information string
		var info = '';
		
		var enf = this.getEnforcements();
		if ( enf === undefined || enf.innings !== FilterEnforcement.ALL )
		{
			var df = this.deriveFilter();
			if ( df.bowler !== undefined )
			{
				if ( CricketFilter.ALL === df.bowler )
				{
					info += 'All bowlers';
				}
				else
				{
					info += df.bowler;
				}
				
				info += ' to ';
				
				if ( CricketFilter.ALL === df.batsman )
				{
					info += 'all batsmen';
				}
				else if ( CricketFilter.RIGHTHANDERS === df.batsman || CricketFilter.LEFTHANDERS === df.batsman )
				{
					info += df.batsman.toLowerCase();
				}
				else
				{
					info += df.batsman;
				}
				
				info += ' in ';
			}
			
			if ( CricketFilter.ALL === df.innings )
			{
				if ( info.length === 0 )
				{
					info += 'A';
				}
				else
				{
					info += 'a';
				}
				
				info += 'll innings';
			}
			else
			{
				info += this.db.getInningsString( df.innings );
			}
		}
//		else
//		{
//			info += ' for the match';
//		}
		
		PULSE.GraphController.setInfo( info );
	}
};

/**
 * Gets the filter show state for the innings, batsman and bowler.
 */
PULSE.GraphController.prototype.getFilterShowState = function ()
{
	var showState = {};
	var showCount = 0;
	var enf = this.getEnforcements();
	var targets = [ 'innings', 'batsman', 'bowler' ];
	
	for ( var i = 0, j = targets.length; i < j; i++ )
	{
		var show = ( ( enf === undefined ) || ( enf[ targets[i] ] !== FilterEnforcement.ALL ) );
		showState[ targets[i] ] = show;
		
		if ( show )
		{
			showCount++;
		}
	}
	
	showState.reset = ( ( showCount > 1 ) || 
			( showCount === 1 && ( enf === undefined || enf.innings !== FilterEnforcement.SPECIFIC ) ) );
	
	return showState;
};

PULSE.GraphController.prototype.render = function ( immediateRender )
{
	// Set the default image
	PULSE.GraphController.setContent( this.ui.backgroundDiv, this.graph.bg );
	
	if ( this.graph.mask !== null )
	{
		PULSE.GraphController.setContent( this.ui.overlayDiv, this.graph.mask );
	}

	// Render the graph
	if ( this.graph.renderer !== null )
	{
		this.graph.renderer.controller = this;
		this.graph.renderer.render( this.db, this.data, this.ui.ctx, immediateRender );
	}
	else
	{
		this.ui.ctx.clear();
	}
};

PULSE.GraphController.prototype.onMouse = function ( event )
{
	// Pass mouse events onto the current graph's renderer if it will accept it
	var g = this.graph;
	if ( g !== null && g.renderer !== null && typeof g.renderer.onMouse === 'function' )
	{
		g.renderer.onMouse( event );
	}
};

// Statics

PULSE.GraphController.setContent = function ( div, content )
{
	// Remove all children
	while ( div.firstChild )
	{
		div.removeChild( div.firstChild );
	}
	
	// Add a new child
	div.appendChild( content );
};


if ( !PULSE ) { PULSE = {}; }

/**
 * Application entry point via Main constructor.
 */
PULSE.GraphMain = function ()
{	
	// Obtain the URL parameters
	var params = Utils.parseUrlParameters( window.location.href );

	// Initialise the tracer with the list of accepted trace levels. Note that there is
	// no concept of a hierarchy here, just matching against a set of strings.
	PULSE.Tracer.init( ['warn','error'] );
	PULSE.Tracer.info( 'Browser detected: ' + PULSE.Browser.ID );
		
	// Set up the region if need be
	var region = 'default';
	if ( params.region )
	{
		region = params.region;
		var regionUrl = PULSE.config.REGION_LOOKUP[ params.region ];
		if ( regionUrl )
		{
			PULSE.config.IMAGE_URL_PREFIX = regionUrl;
		}
	}

	// Now initialise graphs
	graphInit();
	
	// Initialise the interface to the UDS files
	var db = new PULSE.UdsHawkeyeDatabase();
	db.setListener( this );

	// Handle development flags
	if ( params.flags )
	{
		if ( params.flags.indexOf('i') !== -1 )
		{
			PULSE.BallRenderer.mode = 'image';
		}
		if ( params.flags.indexOf('c') !== -1 )
		{
			PULSE.config.wagonWheel.innerClip = 10; 
		}
	}
	
	// Initialise interface to the UI, using the region 
	var ui = new PULSE.NewUI( region );
	
	// Create controller and add references to UI and DB
	this.controller = new PULSE.GraphController( ui, db );
	this.controller.setGraph( 'Trajectory Viewer' );
	this.controller.setView( 1 );
	
	// Augment the database to replace spans with brackets
	PULSE.UdsHawkeyeDatabase.BALL_RUNS_PREFIX = ' (';
	PULSE.UdsHawkeyeDatabase.BALL_RUNS_SUFFIX = ')';
	
	if ( params.cgid )
	{
		// The showGame function defaults to cricinfo if no customer is provided
		this.showGame( params.cgid, params.customer );
	}				
};

PULSE.GraphMain.prototype.showGame = function ( game, customer )
{
	this.controller.showGame( game, customer );
};

/**
 * The inform method is called when the data monitor receives new data from the database.
 */
PULSE.GraphMain.prototype.inform = function ( db )
{
	if ( db.getLastKeys().all !== undefined )
	{
		PULSE.Tracer.info( 'db has informed Main of ' + db.getLastKeys().all + ' as last key' );
		
	    if ( db.getMatchType() !== this.matchType )
	    {
	    	this.matchType = db.getMatchType();
			this.controller.graphProvider.setEnvironment( db.getMatchType(), db.getType() );
			this.controller.ui.setAvailableGraphs( this.controller.graphProvider.getAvailableGraphs() );
			this.controller.setGraph( this.controller.graphProvider.current() );
	    }	    	

		// Make sure we reapply any innings filter in operation
		var optionsFilter = {};
		var inningsSelector = this.controller.ui.getSelectorValues().innings;
		if ( !Utils.isNullish( inningsSelector ) && CricketFilter.ALL !== inningsSelector )
		{
			optionsFilter.innings = db.getInningsFromString( inningsSelector );
		}
		
		// Also do the same for the over filter
		var overSelector = this.controller.ui.getSelectorValues().over;
		if ( !Utils.isNullish( overSelector ) && CricketFilter.WATCHLIVE !== overSelector )
		{
    		var bp = new PULSE.BallProgress( overSelector + '.0' );
    		optionsFilter.innings = +bp.innings;
    		optionsFilter.over = +bp.over;
		}
		
		// And remember any ball filtration
		var ballSelector = this.controller.ui.getSelectorValues().ball;
		if ( !Utils.isNullish( ballSelector ) && CricketFilter.ALL !== ballSelector )
		{
			optionsFilter.ball = +ballSelector;
		}
		
		this.controller.ui.setPopulator( db.getOptions( optionsFilter ) );
		
		this.controller.ui.setEnforcement( this.controller.getEnforcements() );
		this.controller.setRawData( db.getData() );
	}
};

if ( !PULSE ) { var PULSE = {}; }

// Constants for placeholder state to class mapping
PULSE.PlaceholderState = { DATA:'data', NODATA:'nodata', NOFILTEREDDATA:'nofiltereddata' };

/**
 * Constructor. Creates references to selector divs and builds up the graphing div stack.
 */
PULSE.NewUI = function ( region )
{
	var that = this;
	var focus = function ()
	{
		that.setMenuExpanded( false );
	};
	
	// Set up the HtmlSelect components
	this.selectors = {};
	this.selectors.innings = new PULSE.HtmlSelect( 'inningsSelect', that.callback, focus );
	this.selectors.batsman = new PULSE.HtmlSelect( 'batsmanSelect', that.callback, focus );
	this.selectors.bowler = new PULSE.HtmlSelect( 'bowlerSelect', that.callback, focus );
	this.selectors.over = new PULSE.HtmlSelect( 'overSelect', that.callback, focus );
	this.selectors.ball = new PULSE.HtmlSelect( 'ballSelect', that.callback, focus );

	// Build the graphing div stack, made up on the background, the canvas and the overlay,
	// and now the placeholder div
	var graphingDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('relative') );

	var canvasDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('graph layer','graph') );
	
	
	this.backgroundDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('background layer','background')  );
	this.overlayDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('overlay layer','overlay') );
	
	this.placeholderDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('layer nodata','placeholder') );
	this.placeholderDiv.appendChild( PULSE.NewUI.createElement( 'div', PULSE.createClass('dataContent') ) );
	this.placeholderDiv.appendChild( PULSE.NewUI.createElement( 'div', PULSE.createClass('nodataContent-' + region ) ) );
	var nfdDiv = PULSE.NewUI.createElement( 'div', PULSE.createClass('nofiltereddataContent') );
	var nfdDiv2 = PULSE.NewUI.createElement( 'div', PULSE.createClass('textCntr') );
	
	var h1 = PULSE.NewUI.createElement( 'h1' );
	h1.innerHTML = 'No matching data available';
	var h2 = PULSE.NewUI.createElement( 'h2' );
	h2.innerHTML = 'Please select a different feature or combination of players and innings.';
	nfdDiv2.appendChild( h1 );
	nfdDiv2.appendChild( h2 );
	nfdDiv.appendChild( nfdDiv2 );
	
	this.placeholderDiv.appendChild( nfdDiv );
	
	graphingDiv.appendChild( this.backgroundDiv );
	graphingDiv.appendChild( canvasDiv );
	graphingDiv.appendChild( this.overlayDiv );
	graphingDiv.appendChild( this.placeholderDiv );

	var topLevel = document.getElementById( 'pulseGraphing' );
	topLevel.appendChild( graphingDiv );
	
	// Also create the text measuring div if there isn't already one in the DOM
	var tm = document.getElementById( TextMeasurerDivId );
	if ( tm === null )
	{
		tm = PULSE.NewUI.createElement( 'div',
				{ id:TextMeasurerDivId, 
			      style:'position: absolute; left: -1000; top: -1000; width: auto; height: auto; visibility: hidden;' } );
		document.getElementsByTagName('body')[0].appendChild( tm );
	}
	
	// Set up onclick listeners for other control components
	$('#scrolling-prev').click( function() { that.controller.previousGraph(); } );
	$('#scrolling-next').click( function() { that.controller.nextGraph(); } );
	$('#graph-reset').click( function() { that.controller.reset(); } );
	
	// Get carousel reference and configure it
	var carouselConfig = { itemsPerPage:4, itemSize:143 };
	this.carousel = new PULSE.Carousel( 'carousel', this, carouselConfig );
	
	// Set up state associated with traj view navigation
	this.trajViewMetadata = [ PULSE.createClass(''),
	                          PULSE.createClass('slip'),
	                          PULSE.createClass('umpire') ];
	
	this.setSelected = function ( selected )
	{
		for ( var i = 0, ilimit = that.trajViewMetadata.length; i < ilimit; i++ )
		{
			var li = document.getElementById( 'traj-view-' + i );
			var meta = that.trajViewMetadata[ i ];
			
			var clazz = meta['class'] + ( i == selected ? ' active' : '' ); // Coerce!
			li.setAttribute( 'class', clazz );
			li.setAttribute( 'className', clazz );
		}
	};
	
	// Add click listeners for traj view navigation
	this.trajViewNavigation = document.getElementById( 'traj-views' );
	if ( this.trajViewNavigation )
	{
		for ( var i = 0;; i++ )
		{
			var link = document.getElementById( 'traj-view-' + i );
			if ( link )
			{
				$(link).click( function() 
				{ 
					var id = this.getAttribute( 'viewId' );
					that.controller.setView( id );
					that.setSelected( id );
				} );
			}
			else
			{
				break;
			}
		}
	}
	
	// Set up menu
	this.menuContainer = document.getElementById( 'hawkeye-nav' );
	$('#current-graph').click( function() { that.setMenuExpanded(); } );
	$('#current-graph-2').click( function() { that.setMenuExpanded(); } );

	var dropdown = PULSE.NewUI.createElement( 'div', PULSE.createClass('dropdown') );
	this.menuContainer.appendChild( dropdown );
	
	var clip = PULSE.NewUI.createElement( 'div', PULSE.createClass('clip') );
	dropdown.appendChild( clip );
	
	this.menu = PULSE.NewUI.createElement( 'ul' );
	clip.appendChild( this.menu );
		
	/**
	 * Sets the placeholder state, driving the CSS class of the div.
	 */
	PULSE.NewUI.prototype.setPlaceholderState = function ( state )
	{
		that.placeholderDiv.setAttribute( 'class', 'layer placeholder ' + state );
		that.placeholderDiv.setAttribute( 'className', 'layer placeholder ' + state );
	};
	// Initialise placeholder state
	this.setPlaceholderState( PULSE.PlaceholderState.NODATA );

	// Create Raphael-wrapping object 
	this.ctx = { r: Raphael( 'graph', 630, 354 ) };
	
	// Create singleton accessor
	PULSE.NewUI.getInstance = function () { return that; };
};

/**
 * Utility function to create an object with both class and className properties (the latter
 * for IE7)
 */
PULSE.createClass = function ( clazz, id )
{
	var object = { 'class':clazz, 'className':clazz };
	if ( id )
	{
		object.id = id;
	}
	return object;
};

/**
 * Sets the active graph, to apply the active class in the drop-up.
 */
PULSE.NewUI.prototype.setActiveMenuItem = function ( name )
{
	if ( this.menuLookup )
	{
		for ( var thisName in this.menuLookup )
		{
			var element = this.menuLookup[ thisName ];
			if ( element )
			{
				element.setAttribute( 'class', name === thisName ? 'active' : '' );
				element.setAttribute( 'className', name === thisName ? 'active' : '' );
			}
		}
	}
};

/**
 * Sets the available graphs. This rebuilds builds the drop-up menu as well as the carousel area.  
 */
PULSE.NewUI.prototype.setAvailableGraphs = function ( graphs )
{
	// Update the carousel
	this.carousel.setGraphs( graphs );
	
	// Remove all children currently inside the menu 
	while ( this.menu.firstChild )
	{
		this.menu.removeChild( this.menu.firstChild );
	}
	
	var that = this;
	var f = function() 
	{ 
		that.setMenuExpanded( false );
		that.controller.setGraph( this.item );
		that.controller.graphProvider.syncTo( this.item );
	};

	this.menuLookup = {}; 
	for ( var g = 0, glimit = graphs.length; g < glimit; g++ )
	{
		var graph = graphs[g];
		
		// Create anchor
		var a = document.createElement( 'a' );
		a.item = graph;
		$(a).click( f );
		a.innerHTML = graph;
		
		var li = document.createElement( 'li' );
		li.appendChild( a );
		this.menu.appendChild( li );
		
		this.menuLookup[ graph ] = li;
	}
};

/**
 * Selection callback.
 */
PULSE.NewUI.prototype.callback = function ( id, value )
{
	// Obtain UI reference, as we are not sure what 'this' is at this point
	var ui = PULSE.NewUI.getInstance();

	// Obtain selector
	var selector = ui.getSelectorById( id );
	
	// Get all filters
	var selectors = ui.getSelectorValues();

	// If driven from the over selector, then ensure the ball filter is All
	if ( id === 'overSelect' )
	{
		ui.selectors.ball.setSelectedLabel( CricketFilter.ALL );
		selectors.ball = CricketFilter.ALL;
	}
	
	// Set the data filter
	ui.controller.setFilter( selectors );
			
	switch ( id )
	{
		case 'inningsSelect':
			// Set the player filter contents based upon innings
			ui.setPopulator( ui.controller.db.getOptions( { innings:selectors.innings } ) );
			
			// Re-drive the over population based upon the bowler
			ui.callback( 'bowlerSelect', '' );
			break;
			
		case 'bowlerSelect':
		case 'batsmanSelect':
			// Set the over filter contents based upon players and innings
			var options = ui.controller.db.getOptions( { innings:selectors.innings,
						  								 batsman:selectors.batsman, 
						  								 bowler:selectors.bowler } );
			ui.setPopulator( { over:options.over } );
			break;
			
		case 'overSelect':
			var inningsOver = ui.selectors.over.selected.value;
			if ( !Utils.isNullish( inningsOver ) && inningsOver.indexOf( '.' ) !== -1 )
			{
				ui.updateBallSelector( inningsOver );
				ui.setShowSelector( 'ball', true );
			}
			else
			{
				ui.setShowSelector( 'ball', false );
			}
			break;
	}
};

/**
 * Update the ball selector based on the contents of the current innings and over.
 */
PULSE.NewUI.prototype.updateBallSelector = function ( inningsOver )
{
	var ui = PULSE.NewUI.getInstance();
	var bp = new PULSE.BallProgress( inningsOver );
	var selectors = ui.getSelectorValues();
	
	selectors.ball = undefined;
	selectors.innings = +bp.innings;
	selectors.over = +bp.over;
	
	var options = ui.controller.db.getOptions( selectors );
	ui.setPopulator( { ball: options.ball } );
};

/**
 * Obtains a selector object by its ID.
 */
PULSE.NewUI.prototype.getSelectorById = function ( id )
{
	for ( var property in this.selectors )
	{
		if ( this.selectors[ property ].element.id === id )
		{
			return this.selectors[ property ];
		}
	}
};

PULSE.NewUI.prototype.setShow = function ( id, show )
{
	var item = document.getElementById( 'graph-' + id );
	item.setAttribute( 'class', id + ( show ? ' turnedOn' : ' turnedOff' ) );
	item.setAttribute( 'className', id + ( show ? ' turnedOn' : ' turnedOff' ) );
};

PULSE.NewUI.prototype.setShowSelector = function ( name, show, traj )
{
	var selector = this.selectors[ name ];
	if ( !show )
	{
		selector.parent.setAttribute( 'class', 'turnedOff' );
		selector.parent.setAttribute( 'className', 'turnedOff' );
	}
	else
	{
		var root = name.substr( 0, 1 ).toUpperCase() + name.substr( 1 );
		
		var className = 'customDropCntr position' + root;
		if ( 'Bowler' === root && traj )
		{
			className += 'Traj';
		}
		
		selector.parent.setAttribute( 'class', className );
		selector.parent.setAttribute( 'className', className );
	}
};

/**
 * Gets the currently-selected values in the selectors.
 */
PULSE.NewUI.prototype.getSelectorValues = function ()
{
	var values = {};
	for ( var property in this.selectors )
	{
		if ( this.selectors[ property ].selected )
		{
			values[ property ] = this.selectors[ property ].selected.value;
			
			PULSE.Tracer.info( 'Setting ' + property + ' to ' + this.selectors[ property ].selected.value );
		}
	}
		
	return values;
};

/**
 * Sets the visbility of the trajectory viewer view navigation div.
 */
PULSE.NewUI.prototype.setShowViewNavigation = function ( show )
{
	if ( this.trajViewNavigation !== null )
	{
		this.trajViewNavigation.setAttribute( 
				'class', 'trajNav' + ( show ? '' : ' turnedOff' ) );
		this.trajViewNavigation.setAttribute( 
				'className', 'trajNav' + ( show ? '' : ' turnedOff' ) );
	}
};

/**
 * Sets the expansion state of the graph menu drop-up.
 */
PULSE.NewUI.prototype.setMenuExpanded = function ( expanded )
{
	if ( this.menuContainer )
	{
		if ( expanded === undefined )
		{
			// Toggle
			expanded = this.menuContainer.getAttribute( 'class' ).indexOf( 'open' ) === -1;
		}
		
		this.menuContainer.setAttribute( 'class', 'hawkeyeNav' + ( expanded ? ' open' : '' ) );
		this.menuContainer.setAttribute( 'className', 'hawkeyeNav' + ( expanded ? ' open' : '' ) );
	}
};

/**
 * Resyncs the selectors based upon the raw populator and the enforcement.  
 */
PULSE.NewUI.prototype.resync = function ()
{
	PULSE.Tracer.info( '   Resyncing using populator keys ' + Utils.keyArray( this.populator ) );
	
	for ( var selectorId in this.populator )
	{
		var data = Utils.keyArray( this.populator[ selectorId ] );
		
		PULSE.Tracer.info( '   selectorId=' + selectorId );
		
		
		var additionals = [];
		var showLast = false;
	
		// Build additionals
		if ( 'over' === selectorId )
		{
			additionals.push( CricketFilter.WATCHLIVE );
		}
		else if ( 'innings' === selectorId ) 
		{
			if ( this.enforcement !== undefined && this.enforcement.innings !== undefined )
			{
				switch ( this.enforcement.innings )
				{
					case FilterEnforcement.ALL:
						additionals.push( CricketFilter.ALL );
						// Clear other data
						data = [];
						break;
					case FilterEnforcement.SPECIFIC:
						// No additionals, but ensure we show the last item
						showLast = true;
						break;
				}
			}
			else
			{
				additionals.push( CricketFilter.ALL );
			}
		}
		else if ( 'batsman' === selectorId )
		{
			if ( this.enforcement !== undefined && this.enforcement.batsman === FilterEnforcement.ALL )
			{
				additionals.push( CricketFilter.ALL );
				data = [];
			}
			else
			{
				additionals.push( CricketFilter.ALL );
				additionals.push( CricketFilter.LEFTHANDERS );
				additionals.push( CricketFilter.RIGHTHANDERS );
			}
		}
		else if ( 'bowler' === selectorId )
		{
			if ( this.enforcement !== undefined && this.enforcement.bowler === FilterEnforcement.ALL )
			{
				additionals.push( CricketFilter.ALL );
				data = [];
			}
			else
			{
				additionals.push( CricketFilter.ALL );
				additionals.push( CricketFilter.SPINBOWLERS );
				additionals.push( CricketFilter.SEAMBOWLERS );
			}
		}
		else if ( 'ball' === selectorId )
		{
			additionals.push( CricketFilter.ALL );
			
			// Munge the data to add annotations to the data
			data = [];
			for ( var key in this.populator.ball )
			{
				if ( this.populator.ball.hasOwnProperty( key ) )
				{
					data.push( { label:this.populator.ball[key], value:key } );
				}
			}
		}
		
		this.setSelectorData( this.selectors[ selectorId ], data, additionals, showLast );
	}
};

/**
 * Sync the selectors to the given filter, if possible.
 */
PULSE.NewUI.prototype.syncToFilter = function ( filter )
{
	PULSE.Tracer.info( 'Syncing to filter: ' + Utils.toString( filter, true ) );
	
	for ( var property in filter )
	{
		var selector = this.selectors[ property ];
		var value = filter[ property ];
		
		selector.setSelectedValue( value );
	}
	
	// If the over filter is watch live, then hide ball filter
	if ( filter.over === CricketFilter.WATCHLIVE )
	{
		this.setShowSelector( 'ball', false );
	}
};

/**
 * Sets the populator and resyncs the GUI.
 */
PULSE.NewUI.prototype.setPopulator = function ( populator )
{
	if ( !this.populator )
	{
		this.populator = {};
	}
	
	// Augment the populator
	for ( var key in populator )
	{
		this.populator[ key ] = populator[ key ];
	}
	this.resync();
};

/**
 * Sets the enforcement and resyncs the GUI.
 */
PULSE.NewUI.prototype.setEnforcement = function ( enforcement )
{
	if ( this.enforcement !== enforcement )
	{
		this.enforcement = enforcement;
		this.resync();
	}
};

/**
 * Private utility method to set the data for the given selector.
 */
PULSE.NewUI.prototype.setSelectorData = function ( selector, data, additionals, showLast )
{
	// Build actual data array
	var actualData = [];
	if ( additionals !== undefined && additionals.length > 0 )
	{
		actualData = actualData.concat( additionals );
	}
	if ( data !== undefined && data.length > 0 )
	{
		actualData = actualData.concat( data );
	}

	// Tag the data with the correct properties
	var taggedData = [];
	for ( var i = 0, j = actualData.length; i < j; i++ )
	{
		var d = actualData[i];
		
		if ( selector === this.selectors.over )
		{
			// If this is the over data, then munge it to 0-based overs
			if ( d.indexOf( '.' ) !== -1 )
			{
				var bp = new PULSE.BallProgress( d );
				// Removal of innings prefix for Times of India
				//var dminus = bp.innings + '.' + ( +bp.over - 1 );
				var dminus = ( +bp.over - 1 );
				taggedData.push( { label:dminus, value:d } );
				continue;
			}
		}
		else if ( selector === this.selectors.ball )
		{
			if ( typeof d !== 'string' )
			{
				taggedData.push( d );
				continue;
			}
		}
		
		taggedData.push( { label:d } );
	}
	
	PULSE.Tracer.info( 'Setting selector with ' + taggedData.length + ' items' );
	
	if ( selector.setData( taggedData, showLast ) )
	{
		// This selector changed, so make sure we re-drive the selection
		PULSE.Tracer.info( 'Redriving selection of ' + selector.element.id );
		this.callback( selector.element.id, '' );
	}
};

/**
 * STATIC.
 * Utility method to create an element with the give attributes.
 */
PULSE.NewUI.createElement = function ( tag, attributes )
{
	var element = document.createElement( tag );
	if ( attributes !== undefined )
	{
		for ( var attribute in attributes )
		{
			element.setAttribute( attribute, attributes[ attribute ] );
			// IE7 class fix.
			if ( attribute === 'class' )
			{
			    element.setAttribute( 'className', attributes[ attribute ] );
			}
		}
	}
	return element;
};
/**
 * Base64Decoder - Adapted by Lee Hollingdale from http://www.webtoolkit.info/
 */
 
var Base64Decoder = 
{ 
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	decode : function (input) 
	{
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 !== 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
  
		return output;
 	}
};

// Create the namespace if it doesn't already exist
if ( !PULSE ) { var PULSE = {}; }

/**
 * This class provides a means of querying the given database at specified intervals to
 * determine whether the data has changed, and if it has, invoke a callback with the data.
 * 
 * @param interval the monitor interval, in milliseconds
 * @param db the database to query
 * @param callback the callback function to invoke when data is updated
 */
PULSE.DataMonitor = function ( interval, db, callback )
{
	PULSE.Tracer.info( 'DataMonitor created' );

	this.interval = interval;
	this.db = db;
	this.callback = callback; 
	this.timerId = null;
	this.downloading = true;
};

/**
 * Starts the monitor.
 */
PULSE.DataMonitor.prototype.start = function ()
{
	PULSE.Tracer.info( 'DataMonitor started' );
	
	// Stop any existing timer
	if ( this.timerId !== null )
	{
		this.stop();
	}
	
	// Start a new timer
	var that = this;
	
	// Perform an immediate update
	that.onTimer();
	
	// Then set up the timer
	this.timerId = setInterval( function() { that.onTimer(); }, this.interval );
};

/**
 * Called when the timer is fired.
 */
PULSE.DataMonitor.prototype.onTimer = function ()
{
	if ( this.downloading )
	{
		PULSE.Tracer.info( 'DataMonitor timer fired' );
		var that = this;
		this.db.checkForUpdate( function() { that.db.loadData( that.callback ); } );
	}
};

/**
 * Stops the monitor.
 */
PULSE.DataMonitor.prototype.stop = function ()
{
	PULSE.Tracer.info( 'DataMonitor stopped' );

	clearInterval( this.timerId );
	this.timerId = null;
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.Font = function ( family, size, weight )
{
	this['font-family'] = family;
	this['font-size'] = size;
	this['font-weight'] = weight;
};

PULSE.Font.toString = function ()
{
	var s = '';
	
	if ( this['font-weight'] )
	{
		s += this['font-weight'];
	}
	if ( this['font-size'] )
	{
		s += ' ' + this['font-size'] + 'px';
	}
	
	s += this['font-family'];
	
	return s;
};

function Graph( background, mask, renderer )
{
	// Save configuration
	this.bgLoaded = false;
	this.maskLoaded = false;
	this.renderer = renderer;
	
	// Load images asynchronously
	var that = this;
	this.bg = new Image();
	this.bg.onload = function () { that.bgLoaded = true;  };
	
	if ( background )
	{
		this.bg.src = PULSE.config.IMAGE_URL_PREFIX + background;
	}
	
	this.mask = new Image();
	this.mask.onload = function () { that.maskLoaded = true;  };
	
	if ( mask )
	{
		this.mask.src = PULSE.config.IMAGE_URL_PREFIX + mask;
	}
}

Graph.prototype.render = function ( data, ctx )
{
	this.renderer.render( data, ctx );
};

/**
 * Create PULSE namespace if necessary.
 */
if ( !PULSE ) { var PULSE = {}; }

/**
 * Create an HtmlSelect object by ID reference. 
 */
PULSE.HtmlSelect = function ( id, callback, click )
{
	// Obtain HTML Select element
	this.element = document.getElementById( id );
	if ( this.element === null )
	{
		PULSE.Tracer.error( 'Could not find an HtmlSelect element with the ID ' + id );
		return;
	}
	
	// Obtain the parent div
	this.parent = this.element.parentNode;
	
	this.selected = undefined;
	
	// Apply callback to onChange
	var that = this;
	$(this.element).change( function() 
	{
		that.selected = that.element.options[ that.element.selectedIndex ];
		
		PULSE.Tracer.info( 'HtmlSelect callback of ' + that.element.id + '=' + that.selected.value );
		callback( that.element.id, that.selected.value ); 
	} );
	
	if ( click )
	{
		$(this.element).click( click );
	}
	
	// Dummy data setup
	this.setData( [] );
};

/**
 * Sets the CSS classname for the HtmlSelect's parent div.
 */
PULSE.HtmlSelect.prototype.setClassname = function ( classname )
{
	this.parent.setAttribute( 'class', classname );
};

/**
 * Sets the selected label in this HTML Select, if we can.
 */
PULSE.HtmlSelect.prototype.setSelectedLabel = function ( label )
{
	for ( var i = 0, limit = this.element.options.length; i < limit; i++ )
	{
		var item = this.element.options[i];
		if ( item.text === label )
		{
			this.element.selectedIndex = i;
			this.selected = item;
			break;
		}
	}
};

/**
 * Sets the selected value in this HTML Select, if we can.
 */
PULSE.HtmlSelect.prototype.setSelectedValue = function ( value )
{
	for ( var i = 0, limit = this.element.options.length; i < limit; i++ )
	{
		var item = this.element.options[i];
		if ( item.value === value )
		{
			this.element.selectedIndex = i;
			this.selected = item;
			break;
		}
	}
};

/**
 * Clears out the current select options and applies new ones. Ensures that any previously-
 * selected option is reselected, if it exists. If it doesn't, then show either the first
 * or last value (depending on the showLast flag)
 */
PULSE.HtmlSelect.prototype.setData = function ( data, showLast )
{
	// Save the data. We only need this to check whether the item exists during a
	// setSelectedItem call
	this.data = data;

	// Save selection
	var selectedLabel = undefined;
	if ( this.selected )
	{
		selectedLabel = this.selected.text;
		if ( !selectedLabel )
		{
			// IE8/7 do not have a text property
			selectedLabel = this.selected.value;
		}
	}
	
	// Remove all children currently inside the HTML Select 
	while ( this.element.firstChild )
	{
		this.element.removeChild( this.element.firstChild );
	}
	
	// Add Option children
	var hit = false;
	for ( var i = 0, limit = data.length; i < limit; i++ )
	{
		var item = data[i];
		
		// Extract label and value
		var label = item.label;
		var value = item.value;
		if ( value === undefined )
		{
			// Default value to label
			value = label;
			item.value = value;
		}
		
		// Create an option element
		var option = PULSE.NewUI.createElement( 'option' );
		// Set innerText for IE7/8
        option.innerText = label;
        // Set text for modern browsers
        option.text = label;
		option.value = value;

		// Add option as child of select
		this.element.appendChild( option );

		// Check if we have hit the selected label
		if ( label == selectedLabel ) // Coerce!
		{
			this.element.selectedIndex = i;
			this.selected = option;
			hit = true;
		}
	}
	
	// Try to select the previously-selected label. If there wasn't one, or it no longer
	// exists, then just select the first or last item
	var newSelection = false;
	if ( !hit ) 
	{
		newSelection = true;
		if ( data.length > 0 )
		{
			this.element.selectedIndex = showLast ? data.length - 1 : 0;
			this.selected = this.element.options[ this.element.selectedIndex ];
		}
	}
	
	// Return true if there was a new selection
	PULSE.Tracer.info( 'setData resulted in newSelection=' + newSelection );
	
	return newSelection;
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.Levenshtein = {};

PULSE.Levenshtein.MAX_LENGTH = 30;

/**
 * Returns the best-matching string in the candidates array when scored
 * using the Levenshtein distance against the input string.
 * 
 * See http://en.wikipedia.org/wiki/Levenshtein_distance for more info.
 *
 * @param candidates the array of candidate strings
 * @param input the input string
 * @return the best-matching candidate
 */
PULSE.Levenshtein.bestMatch = function ( candidates, input )
{
	var best;
	var bestScore = PULSE.Levenshtein.MAX_LENGTH + 1;
	var normInput = PULSE.Levenshtein.normalise( input );

	for ( var i = 0, j = candidates.length; i < j; i++ )
	{
		var candidate = candidates[i];
		var normCandidate = PULSE.Levenshtein.normalise( candidate ); 
		var score = PULSE.Levenshtein.score( normInput, normCandidate );
		
		if ( score === 0 )
		{
			// These matched perfectly, so return early
			return candidate;
		}
		else if ( score < bestScore )
		{
			// This beat the last best score, so save it
			bestScore = score;
			best = candidate;
		}
	}
	
	return best;
};

/**
 * Normalises a String to all lower case, no non-letters. Also trims the
 * string to MAX_LENGTH.
 * 
 * @param input the input string
 * @return the normalised string
 */
PULSE.Levenshtein.normalise = function ( input )
{
	if ( input )
	{
		// Take out non-letters
		var ret = input.replace( /[^a-zA-Z]/g, '' );
		
		// Lower case
		ret = ret.toLowerCase();
		
		// Trim
		if ( ret.length > PULSE.Levenshtein.MAX_LENGTH )
		{
			ret = ret.substr( 0, PULSE.Levenshtein.MAX_LENGTH );
		}
		
		return ret;
	}
};

/**
 * Internal function to score one string against another using the
 * Levenshtein distance.
 * 
 * @param s1 one string
 * @param s2 the other
 * @return a score; lower represents a better match, 0 is best
 */
PULSE.Levenshtein.score = function ( s1, s2 )
{
	var i, j, dist = [];
	var s1len = s1.length, s2len = s2.length;
	
    for ( i = 0; i <= s1len; i++ )
    {
    	dist[i] = [];
    	dist[i][0] = i;
    }
    for ( j = 0; j <= s2len; j++ )
    {
        dist[0][j] = j;
    }

    for ( j = 1; j <= s2len; j++ )
    {
        for ( i = 1; i <= s1len; i++ )
        {
            if ( s2.charAt( j - 1 ) === s1.charAt( i - 1 ) )
            {
                dist[i][j] = dist[i-1][j-1];
            }
            else
            {
                dist[i][j] = Math.min( Math.min( dist[i-1][j] + 1, dist[i][j-1] + 1),
                                       dist[i-1][j-1] + 1 );
            }
        }
    }
    return dist[s1len][s2len];
};
function OldProjection( xyz, rpy, ar, fl, center ) 
{
	this.xyz 	= xyz;
	this.rpy 	= rpy;
	this.ar  	= ar;
	this.fl  	= fl;
	this.center = center;
	this.LUT 	= [ [ 0, 1, 2 ], [ 1, 0, 2 ], [2, 0, 1] ];
}

OldProjection.prototype.distanceSquared = function ( world )
{
    var dx = world.x - this.xyz.x;
    var dy = world.y - this.xyz.y;
    var dz = world.z - this.xyz.z;
    var dsquared = dx*dx + dy*dy + dz*dz;
    return dsquared;
};

OldProjection.prototype.project = function ( world )
{
	if ( this.rot === undefined )
	{
		this.rot = this.makeRotation();
	}
	
	var newWorld = [ world.x - this.xyz.x, world.y - this.xyz.y, world.z - this.xyz.z ];
	var cam = this.matrixVectorMultiply( this.rot, newWorld );
	
	if ( cam[2] < 1e-9 )
	{
		cam[2] = -1e-9;
	}

    var x = this.center.x + ( ( cam[0] / cam[2] ) * this.fl );
    var y = this.center.y + ( ( cam[1] / cam[2] ) * this.fl * this.ar );
    return { x:x, y:y, dsquared:this.distanceSquared( world ) };
};

// Returns a 3x3 matrix
OldProjection.prototype.makeRotation = function()
{
    var mRoll  = this.axisRotation( 2, this.rpy.r );
    var mPitch = this.axisRotation( 0, this.rpy.p );
    var mYaw   = this.axisRotation( 2, this.rpy.y );

    var m = this.matrixMatrixMultiply( mRoll, mPitch );
    m = this.matrixMatrixMultiply( m, mYaw );

    return m;
};
	
// Returns a 3x3 matric
OldProjection.prototype.axisRotation = function( axis, angle )
{
    var i0 = this.LUT[axis][0];
    var i1 = this.LUT[axis][1];
    var i2 = this.LUT[axis][2];

    var rot = [ [0,0,0], [0,0,0], [0,0,0] ]; 
    rot[i0][i0] = 1.0;
    rot[i1][i1] = Math.cos( angle );
    rot[i2][i2] = Math.cos( angle );
    rot[i1][i2] = Math.sin( angle );
    rot[i2][i1] = -rot[i1][i2];

    return rot;
};
	
// Returns a 3x3 matrix
OldProjection.prototype.matrixMatrixMultiply = function( a, b )
{
	return [
	        [ a[0][0]*b[0][0] + a[0][1]*b[1][0] + a[0][2]*b[2][0], a[0][0]*b[0][1] + a[0][1]*b[1][1] + a[0][2]*b[2][1], a[0][0]*b[0][2] + a[0][1]*b[1][2] + a[0][2]*b[2][2] ],
	        [ a[1][0]*b[0][0] + a[1][1]*b[1][0] + a[1][2]*b[2][0], a[1][0]*b[0][1] + a[1][1]*b[1][1] + a[1][2]*b[2][1],	a[1][0]*b[0][2] + a[1][1]*b[1][2] + a[1][2]*b[2][2] ],
            [ a[2][0]*b[0][0] + a[2][1]*b[1][0] + a[2][2]*b[2][0], a[2][0]*b[0][1] + a[2][1]*b[1][1] + a[2][2]*b[2][1],	a[2][0]*b[0][2] + a[2][1]*b[1][2] + a[2][2]*b[2][2] ]
	       ];
};
	
// Returns a 3x3 matrix
OldProjection.prototype.matrixVectorMultiply = function( a, b )
{
	return [ a[0][0]*b[0] + a[0][1]*b[1] + a[0][2]*b[2],
	         a[1][0]*b[0] + a[1][1]*b[1] + a[1][2]*b[2],
	         a[2][0]*b[0] + a[2][1]*b[1] + a[2][2]*b[2] ];
};

function Participant( rawString )
{
	if ( rawString )
	{
		var fields = rawString.split( ',' );
		
		this.fullName = fields[0];
		this.shortName = fields[1];
		this.abbreviation = fields[2];
		this.primaryColor = '#' + fields[3];
		this.secondaryColor = '#' + fields[4];
	}
}

if ( !PULSE ) { var PULSE = {}; }

PULSE.RaphaelAxis = function ( title, min, max, start, end, fixed, numLabels, labels, overdraw, shift, titleShift )
{
	this.title = title;
	this.min = min;
	this.max = max;
	this.configuredMax = max;
	this.start = start;
	this.end = end;
	this.configuredEnd = end;
	this.fixed = fixed;
	this.numLabels = numLabels;
	this.labels = labels;
	this.overdraw 	= overdraw   === undefined ? 0 : overdraw;
	this.shift 		= shift 	 === undefined ? 0 : shift;
	this.titleShift = titleShift === undefined ? 0 : titleShift;
};

PULSE.RaphaelAxis.prototype.project = function ( value )
{
	// Clamp the value to within the range
	var clamped = value;
	if ( clamped < this.min )
	{
		clamped = this.min;
	}
	if ( clamped > this.max )
	{
		clamped = this.max;
	}
	
	return this.shift + this.start + 
		( ( ( clamped - this.min ) / ( this.max - this.min ) ) * ( this.end - this.start ) );
};
	
PULSE.RaphaelAxis.prototype.drawTo = function ( r, isX )
{
	var attrs = this.font;
	attrs.fill = '#fff';
	
	var path = 'M';
	if ( isX )
	{
		path += this.start + ' ' + this.fixed;
		path += 'L' + ( this.end + this.overdraw ) + ' ' + this.fixed;
	}
	else
	{
		path += this.fixed + ' ' + this.start;
		path += 'L' + this.fixed + ' ' + ( this.end + this.overdraw );
	}
	
	r.path( path )
	 .attr( { stroke:'#fff', fill:'none', 'stroke-width':2, 'stroke-linecap':'square' } );
	
	// Draw tick labels
	var spacing = Math.round( ( this.max - this.min ) / this.numLabels );
	
	// Round spacing to the nearest 10, if we can
	var newSpacing = 10 * ( Math.round( spacing / 10 ) );
	if ( newSpacing > 0 )
	{
		spacing = newSpacing;
	}
	
	for ( var val = this.min; val <= this.max; val += spacing )
	{
		var pos = this.project( val );
		
		var label = val;
		if ( this.labels !== undefined && this.labels[ val ] !== undefined )
		{
			label = this.labels[ val ];
		}
		
		if ( isX )
		{
			r.text( pos, PULSE.Browser.y( this.fixed + 9 ), label )
			 .attr( attrs );
		}
		else
		{
			r.text( this.fixed - 6, PULSE.Browser.y( pos ), label )
			 .attr( attrs ).attr( { 'text-anchor':'end' } );
		}
	}
		
	// Draw axis title
	var pos = this.project( ( this.min + this.max ) / 2 );
	if ( isX )
	{
		r.text( pos, PULSE.Browser.y( this.fixed + 25 + this.titleShift ), this.title )
		 .attr( attrs );
	}
	else
	{
		var x = this.fixed - 37 - this.titleShift;
		var y = PULSE.Browser.y( pos );
		
		r.text( x, y, this.title ).rotate( -90 ).attr( attrs );
	}
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.RaphaelFlexikey = function ( config )
{
	this.entries = [];
	this.config = config;
};

PULSE.RaphaelFlexikey.prototype.addEntry = function ( label, color )
{
	this.entries.push( { label:label, color:color } );
};

PULSE.RaphaelFlexikey.prototype.render = function ( r )
{
	// Create a set to group all Raphael components
	var set = r.set();
	
	// Calculate the size of the flexikey
	var height = this.config.margin.top;
	var width = this.config.margin.left;
	
	var maxWidth = 0;
	var sheight = 0;
	
	// Create background and add it to the set
	var bg = r.rect()
    		  .attr( { fill:this.config.background.color, stroke:'none',
    			  	   opacity:this.config.background.opacity } );
	set.push( bg );

	// Create common label attributes
	var attrs = this.config.font;
	attrs.fill = '#fff';
	attrs.stroke = 'none';
	attrs['text-anchor'] = 'start';
	attrs.x = width + this.config.swatch.size + this.config.swatch.spacing;
	
	// Iterate over labels, adding text objects and calculating overall size
	var y = this.config.margin.top + ( this.config.spacing * 1.5 );
	for ( var i = 0, j = this.entries.length; i < j; i++ )
	{
		var entry = this.entries[i];
		
		attrs.y = PULSE.Browser.y( y );
		
		// Add label
		var label = r.text( 0, 0, entry.label ).attr( attrs );
		set.push( label );
		
		var ss = label.getBBox();
		
		height += ss.height + this.config.spacing;
		sheight = ss.height;
		
		if ( ss.width > maxWidth )
		{
			maxWidth = ss.width;
		}
		
		// Add swatch
		var swatch = r.circle( this.config.margin.left + ( this.config.swatch.size / 2 ), y, 
				               this.config.swatch.size / 2 )
		  		 	  .attr( { fill:entry.color, stroke:'none' } );
		set.push( swatch );
		
		y += ss.height + this.config.spacing;
	}
	
	// Update size of background 
	height += this.config.margin.bottom - this.config.spacing;
	width += this.config.swatch.size + this.config.swatch.spacing + maxWidth + this.config.margin.right;

	bg.attr( { width:width, height:height } );
	
	// Calculate new origin
	var origin = Utils.adjustForAnchor( this.config.position.x, this.config.position.y,
			   { width:width, height:height }, this.config.position.anchor );
	
	// Move all components to new origin 
	set.translate( origin.x, origin.y );
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.RaphaelNonLinearAxis = function ( title, min, max, start, end, fixed, numLabels, spec, labels )
{
	this.title = title;
	this.min = min;
	this.max = max;
	this.start = start;
	this.end = end;
	this.fixed = fixed;
	this.numLabels = numLabels;
	this.spec = spec;
	this.labels = labels;
	
	this.overdraw = 0;
	this.shift = 0;
	this.titleShift = 0;
}

PULSE.RaphaelNonLinearAxis.prototype.project = function ( value )
{
	// Clamp the value to within the range
	var clamped = value;
	if ( clamped < this.min )
	{
		clamped = this.min;
	}
	if ( clamped > this.max )
	{
		clamped = this.max;
	}
	
	// Now apply the non-linear spec
	var proportion;
	for ( var i = 1, j = this.spec.length; i < j; i++ )
	{
		var limit = this.spec[i][0];
		var fraction = this.spec[i][1];
		
		if ( clamped <= limit )
		{
			// Add the fraction from the previous limit
			proportion = this.spec[i-1][1];
			
			// Add the proportional size in this limit
			var dx = this.spec[i][0] - this.spec[i-1][0];
			var xx = clamped - this.spec[i-1][0];
			var dy = this.spec[i][1] - this.spec[i-1][1];
			
			proportion += ( xx / dx ) * dy; 
			break;
		}
	}
	
	return this.start + ( proportion * ( this.end - this.start ) );
};

PULSE.RaphaelNonLinearAxis.prototype.drawTo = PULSE.RaphaelAxis.prototype.drawTo;

if ( !PULSE ) { var PULSE = {}; }

PULSE.RaphaelTextField = function ( config )
{
	this.lines = [];
	this.config = config;
	
	this.additional = {};
	this.additional.height = 0;
	this.additional.width = 0;
}

PULSE.RaphaelTextField.prototype.addLine = function ( line )
{
	this.lines.push( line );
};

PULSE.RaphaelTextField.prototype.setLines = function ( lines )
{
	this.lines = lines;
};

PULSE.RaphaelTextField.prototype.fallsWithin = function ( xy )
{
	return xy.x >= this.bounds.x && xy.x <= ( this.bounds.x + this.bounds.width ) &&
	       xy.y >= this.bounds.y && xy.y <= ( this.bounds.y + this.bounds.height );
};

PULSE.RaphaelTextField.prototype.render = function ( r, set )
{
	// Calculate the size of the container
	var height = this.config.margin.top;
	var width = this.config.margin.left;
	var texts = [];
	var bg = r.rect();
	
	set.push( bg );
	
	var maxWidth = 0;
	var sheight = 0;
	var y = this.config.margin.top + ( this.config.spacing * 2 );
	
	for ( var i = 0, j = this.lines.length; i < j; i++ )
	{
		var lineWidth = 0;
		var components = PULSE.RaphaelTextField.getTextComponents( this.lines[i] );

		for ( var c = 0, climit = components.length; c < climit; c++ )
		{
			var attrs = this.config.font;
			attrs['text-anchor'] = 'start';
			attrs.stroke = 'none';
			attrs.fill = components[c].color ? components[c].color : '#fff';
			attrs.x = this.config.margin.left + lineWidth;
			attrs.y = PULSE.Browser.y( y );

			var text = r.text( 0, 0, components[c].text )
			            .attr( attrs ); 
			texts.push( text );
			set.push( text );
			
			var bb = text.getBBox();
			sheight = bb.height;
			
			lineWidth += bb.width;
			if ( ( components[c].text.charAt(components[c].text.length-1) === ' ' ) 
					&& PULSE.Browser && PULSE.Browser.addSpacer )
			{
				lineWidth += ( bb.width / components[c].text.length ) * 0.75;
			}
		}

		if ( lineWidth > maxWidth )
		{
			maxWidth = lineWidth;
			bg.attr( { width:maxWidth } );
		}			
		
		height += bb.height + this.config.spacing;
		y += sheight + this.config.spacing;
	}
	
	height += this.config.margin.bottom - this.config.spacing + this.additional.height;
	width += maxWidth + this.config.margin.right + this.additional.width;
	
	// Position the background
	bg.attr( { x:0, y:0, width:width, height:height, 
		       fill:this.config.background.color, opacity:this.config.background.opacity } );
	
	// Draw the optional border
	if ( this.config.border )
	{
		set.push( r.rect( 0, 0, width, height )
				   .attr( { 'stroke-width':this.config.border.width, stroke:this.config.border.color,
					        opacity:this.config.border.opacity } ) );
		
		// Draw the optional anchor indicator
		if ( this.config.border.indicator > 0 )
		{
			var points = [];
			switch ( this.config.position.anchor )
			{
				case 'nw':
					points = [ { x:0, y:this.config.border.indicator }, 
					           { x:0, y:0 }, 
					           { x:this.config.border.indicator, y:0 } ];
					break;
				case 'ne':
					points = [ { x:0 + width - this.config.border.indicator, y:0 }, 
					           { x:0 + width, y:0 }, 
					           { x:0 + width, y:this.config.border.indicator } ];
					break;
				case 'se':
					points = [ { x:0 + width - this.config.border.indicator, y:height }, 
					           { x:0 + width, y:height }, 
					           { x:0 + width, y:height - this.config.border.indicator } ];
					break;
				case 'sw':
					points = [ { x:0, y:height - this.config.border.indicator }, 
					           { x:0, y:height }, 
					           { x:0 + this.config.border.indicator, y:height } ];
					break;
			}
			
			var path = '';
			for ( var p = 0, plimit = points.length; p < plimit; p++ )
			{
				var point = points[p];
				if ( p === 0 )
				{
					path += 'M';
				}
				else
				{
					path += 'L';
				}
				path += point.x;
				path += ' ';
				path += point.y;
			}
			
			set.push( r.path( path + 'z' ).attr( { fill:this.config.border.color,
				                                   opacity:this.config.border.opacity,
				                                   stroke:'none' } ) );
		}
	}
	
	// Move everthing to the correct position
	var origin = Utils.adjustForAnchor( this.config.position.x, this.config.position.y,
			           { width:width, height:height }, this.config.position.anchor );
	set.translate( origin.x, origin.y );
	
	// Save bounds
	this.bounds = { x:origin.x, y:origin.y, width:width, height:height };
};

PULSE.RaphaelTextField.prototype.setHighlight = function ( hl, ctx )
{
	ctx.save();
	ctx.lineWidth = hl ? this.config.hlborder.width : this.config.border.width;
	ctx.strokeStyle = hl ? this.config.hlborder.color : this.config.border.color;
	ctx.beginPath();
	ctx.rect( this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height );
	ctx.stroke();
	ctx.restore();
};

PULSE.RaphaelTextField.getTextComponents = function ( string )
{
	var components = [];
	
	var scan = 0;
	var more = true;

	while ( more )
	{
		var fragment = string.substring( scan );
		var color = undefined;
		
		var tagStart = string.indexOf( '<c:', scan );
		if ( tagStart !== -1 )
		{	
			var tagClose = string.indexOf( '>', tagStart );
			var tagEnd = string.indexOf( '</c>', tagStart );
			
			var color = string.substring( tagStart + 3, tagClose );
			fragment = string.substring( tagClose + 1, tagEnd );

			// Draw the prefragment
			var preFragment = string.substring( scan, tagStart );
			
			if ( preFragment.length > 0 )
			{
				components.push( { text:preFragment } );
			}
			
			scan = tagEnd + 4;
		}
		else
		{
			more = false;
		}
		
		if ( fragment.length > 0 )
		{
			components.push( { text:fragment, color:color } );
		}
	}
	
	return components;
};

// Create the namespace if it doesn't already exist
if ( !PULSE ) { var PULSE = {}; }

// Create the Tracer static 
PULSE.Tracer = {};

// Constants
PULSE.Tracer.TRACING_ELEMENT_ID = 'PulseTracer';

// Initialisation method
// @param acceptedLevels an array of trace level names that will be output to the trace area
PULSE.Tracer.init = function ( acceptedLevels )
{
	// Save the accepted levels
	PULSE.Tracer.acceptedLevel = {};
	for ( var i = 0, j = acceptedLevels.length; i < j; i++ )
	{
		PULSE.Tracer.acceptedLevel[ acceptedLevels[i] ] = true;
	}
	
	// Obtain the tracing element if it exists
	//var tracingElement = document.getElementById( PULSE.Tracer.TRACING_ELEMENT_ID );
	//if ( tracingElement === null )
	//{
		// Create a new one
		//tracingElement = document.createElement( 'div' );
		//tracingElement.id = PULSE.Tracer.TRACING_ELEMENT_ID;
		
		// Attach it to the head
		//document.getElementsByTagName('head')[0].appendChild( tracingElement );
	//}
	
	// Save the reference
	//PULSE.Tracer.tracingElement = tracingElement;
};

// Method to add a trace message at debug level
PULSE.Tracer.debug = function ( message )
{
	PULSE.Tracer.addTrace( 'debug', message );
};

// Method to add a trace message at info level
PULSE.Tracer.info = function ( message )
{
	PULSE.Tracer.addTrace( 'info', message );
};

// Method to add a trace message at warn level
PULSE.Tracer.warn = function ( message )
{
	PULSE.Tracer.addTrace( 'warn', message );
};

// Method to add a trace message at error level
PULSE.Tracer.error = function ( message )
{
	PULSE.Tracer.addTrace( 'error', message );
};

// Adds a trace method at the given level, if that trace level is accepted
// @param level the level, an arbitrary string
// @param message the message to trace 
PULSE.Tracer.addTrace = function ( level, message )
{
	var format = function ( value, size, pad )
	{
		if ( size === undefined )
		{
			size = 2;
		}
		if ( pad === undefined )
		{
			pad = '0';
		}
		var s = String( value );
		while ( s.length < Math.abs( size ) )
		{
			if ( size > 0 )
			{
				s = pad + s;
			}
			else
			{
				s = s + pad;
			}
		}
		return s;
	};
	
	if ( PULSE.Tracer.acceptedLevel !== undefined && PULSE.Tracer.acceptedLevel[ level ] )
	{
		var date = new Date();
		var ts = date.getFullYear() + '-' + format( date.getMonth() + 1 ) + '-' + 
				 format( date.getDate() ) + ' ' + format( date.getHours() ) + ':' + 
				 format( date.getMinutes() ) + ':' + format( date.getSeconds() ) + '.' +
				 format( date.getMilliseconds(), 3 );
		
		var msg = ts + ' [' + format( level, -5, ' ' ) + '] ' + message;
		
		// No longer trace to the head div
		//PULSE.Tracer.tracingElement.appendChild( document.createTextNode( msg ) );
		
		// Also log to console
		if ( window.console )
		{
			if ( 'info' === level )
			{
				console.info( msg );
			}
			else if ( 'warn' === level )
			{
				console.warn( msg );
			}
			else if ( 'error' === level )
			{
				console.error( msg );
			}
			else
			{
				console.log( msg );
			}
		}
	}
};

// Clears the tracing div of children
PULSE.Tracer.clear = function ()
{
	//while ( PULSE.Tracer.tracingElement.firstChild )
	//{
	//	PULSE.Tracer.tracingElement.removeChild( PULSE.Tracer.tracingElement.firstChild );
	//}
};

var Utils = 
{
	intermediateColor : function ( from, to, fraction )
	{
		var color = to;
		if ( '#' === from.charAt(0) && '#' === to.charAt(0) &&
			   4 === from.length    &&   4 === to.length )
		{
			var froms = { r:parseInt( from.charAt(1), 16 ), 
				          g:parseInt( from.charAt(2), 16 ), 
				          b:parseInt( from.charAt(3), 16 ) };
			var tos = { r:parseInt( to.charAt(1), 16 ), 
				        g:parseInt( to.charAt(2), 16 ), 
				        b:parseInt( to.charAt(3), 16 ) };
		
			var rr = froms.r + ( fraction * ( tos.r - froms.r ) );
			var gg = froms.g + ( fraction * ( tos.g - froms.g ) );
			var bb = froms.b + ( fraction * ( tos.b - froms.b ) );

			color = '#' + Math.round( rr ).toString( 16 ) +
	        			  Math.round( gg ).toString( 16 ) +
	        			  Math.round( bb ).toString( 16 );
		}
		return color;
	},
		
	createElement : function ( tag, attributes )
	{
		var element = document.createElement( tag );
		if ( attributes !== undefined )
		{
			for ( var attribute in attributes )
			{
				element.setAttribute( attribute, attributes[ attribute ] );
			}
		}
		return element;
	},
		
	toString : function ( object, singleLine )
	{
		if ( object !== undefined && object !== null )
		{
			if ( typeof object.length === 'number' &&
	                !(object.propertyIsEnumerable('length')) &&
	                typeof object.splice === 'function' )
			{
				var message = '[ ';
				// This looks like an array
				for ( var i = 0, j = object.length; i < j; i++ )
				{
					message += Utils.toString( object[i], singleLine ) + ',';
					
					if ( !singleLine )
					{
						message += '\n';
					}
				}
				message += ' ]';
				return message;
			}
		
			var message = '';
			var t = typeof object;
			if ( 'string' === t )
			{
				message += '"';
				message += object;
				message += '"';
			}
			else if ( 'number' === t || 'boolean' === t )
			{
				message += object;
			}
			else
			{
				message += "{";
			
				for ( var property in object )
				{
					if ( 'function' !== typeof object[ property ] )
					{
						message += property + ':' + Utils.toString( object[ property ], singleLine ) + ',';
						
						if ( !singleLine )
						{
							message += '\n';
						}
					}
				}

				message += '}';
			}
			return message;
		}
	},
		
	toReallyFixed : function ( value, fixation )
	{
		var text = value.toFixed( fixation );
		if ( text.indexOf( '.' ) === -1 )
		{
			text += '.0';
		}
		return text;
	},
	
	dump : function ( object )
	{
		var message = typeof object + "\n";
		if ( 'string' === typeof object )
		{
			message += object;
		}
		else
		{
			for ( var property in object )
			{
				if ( 'function' !== typeof object[ property ] )
				{
					message += property + ": '" + object[ property ] + "'\n";
				}
			}
		}
		alert( message );
	},

	dumpFunctions : function ( object )
	{
		var message = 'Object functions:\n';
		for ( var property in object )
		{
			if ( 'function' === typeof object[property] )
			{
				message += property + '\n';
			}
		}
		alert( message );
	},
	
	cloneArray : function ( input )
	{
		var array = [];
		for ( var i = 0, j = input.length; i < j; i++ )
		{
			array.push( input[i] );
		}
		return array;
	},
	
	cloneObject : function ( object )
	{
		var newObject = {};
		for ( var property in object )
		{
			if ( object.hasOwnProperty( property ) )
			{
				if ( 'object' === typeof object[ property ] )
				{
					newObject[ property ] = this.cloneObject( object[ property ] );
				}
				else
				{
					newObject[ property ] = object[ property ];
				}
			}
		}
		return newObject;
	},
	
	// Lifted from jQuery
	trim : function ( text ) 
	{
		return ( text || "" ).replace( /^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" );
	},
	
	/**
	 * Convenience function to draw a circle.
	 */
	circle : function ( context, x, y, radius )
	{
		context.arc( x, y, radius, 0, Math.PI * 2, false );
	},
	
	/**
	 * Convenience function to draw an oval 
	 */
	oval : function ( ctx, x, y, radius, xscale, yscale )
	{
		ctx.save();
		ctx.scale( xscale, yscale );
		Utils.circle( ctx, x / xscale, y / yscale, radius );
		ctx.restore();
	},

	/**
	 * Convenience function to draw a polygon
	 */
	polygon : function ( ctx, points )
	{
		ctx.beginPath();
		for ( var i = 0, j = points.length; i < j; i++ )
		{
			if ( i === 0 )
			{
				ctx.moveTo( points[i].x, points[i].y );
			}
			else
			{
				ctx.lineTo( points[i].x, points[i].y );
			}
		}
		ctx.closePath();
	},
	
	/**
	 * Draws a justified string.
	 */
	anchoredFillText : function ( ctx, text, x, y, anchor )
	{
		// These two vars for strokeText only
		var weight = ctx.font.indexOf( 'Bold' ) === -1 ? 100 : 180;
		var width = 90;

		var t = String( text );

		// Ensure the string contains no unsupported characters, on iPad
		if ( isiPad() )
		{
			var cc = t.charCodeAt( 0 );
			if ( cc === 8805 )
			{
				t = '>' + t.substring( 1 );
			}
			else if ( cc === 8804 )
			{
				t = '<' + t.substring( 1 );
			}
		}
		
		var size = this.stringSize( ctx, t, weight, width );
		
		var xx = x - ( size.width / 2 );
		var yy = y + ( size.height * 0.43 );
		
		if ( 'e' === anchor || 'ne' === anchor || 'se' === anchor )
		{
			xx = x - size.width;
		}
		else if ( 'w' === anchor || 'nw' === anchor || 'sw' === anchor )
		{
			xx = x; 
		}
		
		if ( 'n' === anchor || 'nw' === anchor || 'ne' === anchor )
		{
			yy = y + ( size.height * 0.66 );
		}
		else if ( 's' === anchor || 'sw' === anchor || 'se' === anchor )
		{
			yy = y;
		}

		if ( !isiPad() )
		{
			ctx.fillText( t, xx, yy );
		}
		else
		{
			yy -= size.height - 3;
			
			ctx.save();
			ctx.strokeStyle = ctx.fillStyle;
			ctx.strokeText( t, xx, yy, 2 * this.extractFontSize( ctx.font ) * 0.9, weight, width );
			ctx.restore();
		}
	},
	
	/**
	 * Obtains the font size from a font string, typically ctx.font. 
	 */
	extractFontSize : function ( specifier )
	{
		var fields = specifier.split( ' ' );
		for ( var i = 0, j = fields.length; i < j; i++ )
		{
			if ( fields[i].indexOf( 'px' ) !== -1 )
			{
				return parseInt( fields[i] );
			}
		}
		// Default to 12
		return 12;
	},
	
	/**
	 * Adjusts the given xy for the anchor and size.
	 */
	adjustForAnchor : function ( x, y, size, anchor )
	{
		var xx = x - ( size.width / 2 );
		var yy = y - ( size.height / 2 ); 

		if ( 'e' === anchor || 'ne' === anchor || 'se' === anchor )
		{
			xx = x - size.width;
		}
		else if ( 'w' === anchor || 'nw' === anchor || 'sw' === anchor )
		{
			xx = x; 
		}
		
		if ( 'n' === anchor || 'nw' === anchor || 'ne' === anchor )
		{
			yy = y;
		}
		else if ( 's' === anchor || 'sw' === anchor || 'se' === anchor )
		{
			yy = y - size.height;
		}
		
		return { x:xx, y:yy };
	},
	
	/**
	 * Returns the size of the given text in the current graphics context.
	 */
	stringSize : function ( ctx, string, weight, width )
	{
		if ( !isiPad() )
		{
			string = string.replace( / /g, '&nbsp;' );
			
			var element = document.getElementById( TextMeasurerDivId );
			element.innerHTML = string;
			element.style.font = ctx.font;
			
			return { height : element.offsetHeight,
					 width  : element.offsetWidth };
		}
		else
		{
			var fontsz = this.extractFontSize( ctx.font ) * 0.9;
			return { height : get_textHeight( fontsz ),
					 width  : get_textWidth( string, fontsz, width ) };
		}
	},
	
	/**
	 * Returns the maximum, mean and minimum value in an array of numbers.
	 */
	getStats : function ( array )
	{
		var max = Number.MIN_VALUE;
		var min = Number.MAX_VALUE;
		var tot = 0;
		
		for ( var i = 0, j = array.length; i < j; i++ )
		{
			if ( array[i] > max )
			{
				max = array[i];
			}
			if ( array[i] < min )
			{
				min = array[i];
			}
			tot += array[i];
		}
		
		return { maximum: max, minimum: min, mean: tot / array.length };
	},
	
	/**
	 * Gets the 5-number summary for an array of numbers
	 */
	getFiveNumberSummary : function ( array )
	{
		var count = array.length;
		if ( count > 0 )
		{
			var sorted = Utils.cloneArray( array );
			sorted.sort( function ( a, b ) { return a - b; } );
		
			var min = sorted[0];
			var max = sorted[count-1];
			var median = Utils.getMedian( sorted );
			
			var lower, upper;
			if ( count % 2 === 0 )
			{
				lower = sorted.slice( 0, count / 2 );
				upper = sorted.slice( count / 2 );
			}
			else
			{
				lower = sorted.slice( 0, Math.floor( count / 2 ) );
				upper = sorted.slice( Math.ceil( count / 2 ) );
			}

			var lq = Utils.getMedian( lower );
			var uq = Utils.getMedian( upper );
			
			return { min:min, lq:lq, median:median, uq:uq, max:max };  
		}
	},
	
	getMedian : function ( sortedArray )
	{
		var count = sortedArray.length;
		if ( count % 2 === 0 )
		{
			return ( ( sortedArray[ ( count / 2 ) - 1 ] + 
					   sortedArray[ ( count / 2 ) ] ) / 2 );
		}
		else
		{
			return sortedArray[ Math.floor( count / 2 ) ];
		}
	},
	
	/**
	 * Gets the mouse XY value from a mouse event. This method provides some level of 
	 * cross-browser support.
	 */
	getXY : function ( event )
	{
	    if ( event.offsetX ) 
	    {
	        return { x:event.offsetX, y:event.offsetY };
	    }
	    else if( event.layerX ) 
	    {
	        return { x:event.layerX, y:event.layerY };
	    }
	    else if( event.originalEvent && event.originalEvent.layerX ) 
	    {
	        return { x:event.originalEvent.layerX, y:event.originalEvent.layerY };
	    }
	},
	
	/**
	 * Returns true if the given item is in the array. Equality determined by ===.
	 */
	isInArray : function ( array, item )
	{
		if ( array !== undefined )
		{
			for ( var i = 0, j = array.length; i < j; i++ )
			{
				if ( array[i] === item )
				{
					return true;
				}
			}
		}
		return false;
	},
	
	/**
	 * Toggles the existence of a member in an array, returning a new array.
	 */
	toggleExistence : function ( array, item )
	{
		if ( Utils.isInArray( array, item ) )
		{
			// Remove it
			var newArray = [];
			for ( var i = 0, j = array.length; i < j; i++ )
			{
				if ( array[i] != item )  // Coerce
				{
					newArray.push( array[i] );
				}
			}
			return newArray;
		}
		else
		{
			// Add it
			return array.concat( item );
		}
	},

	/**
	 * Scales a line that goes from point A to point B to be the given length. 
	 */
	scaleLine : function ( from, to, length )
	{
		var dx = to.x - from.x;
		var dy = to.y - from.y;
		
		var currentLength = Math.sqrt( ( dx*dx ) + ( dy*dy ) );
		var multiplier = length / currentLength;
		
		return { x: from.x + ( multiplier * dx ),
				 y: from.y + ( multiplier * dy ) };
	},

	/**
	 * Scales a line that goes from point A to point B to be the given percentage of its length,
	 * if it is longer than a given absolute length. 
	 */
	scaleLineRel : function ( from, to, threshold, scaler )
	{
		var dx = to.x - from.x;
		var dy = to.y - from.y;
		
		var currentLength = Math.sqrt( ( dx*dx ) + ( dy*dy ) );
		
		if ( currentLength > threshold )
		{
			var multiplier = scaler * threshold / currentLength;
			return { x: from.x + ( multiplier * dx ),
				 	 y: from.y + ( multiplier * dy ) };
		}
		else
		{
			return to;
		}
	},
	
	/**
	 * Returns true if the given string is null-like. 
	 */
	isNullish : function ( string )
	{
		return string === undefined || string === null || string === 'null' || string.length === 0;
	},
	
	/**
	 * Returns the array of keys in the given object.
	 */
	keyArray : function ( object )
	{
		var array = [];
		for ( var property in object )
		{
			if ( object.hasOwnProperty( property ) )
			{
				array.push( property );
			}
		}
		return array;
	},
	
	/**
	 * Returns the array of values in the given object.
	 */
	valueArray : function ( object )
	{
		var array = [];
		for ( var property in object )
		{
			if ( object.hasOwnProperty( property ) )
			{
				array.push( object[property] );
			}
		}
		return array;
	},
	
	/**
	 * Returns the minimum, maximum and mean values in the given list of numbers.
	 */
	range : function ( list )
	{
		var min, max, total = 0, count = 0;
		
		if ( list )
		{
			for ( var i = 0, limit = list.length; i < limit; i++ )
			{
				var value = +list[i];
				if ( !min || value < min )
				{
					min = value;
				}
				if ( !max || value > max )
				{
					max = value;
				}
				count++;
				total += value;
			}
		}
		
		var mean;
		if ( count > 0 )
		{
			mean = total / count;
		}
		
		return { min:min, max:max, mean:mean };
	},
	
	/**
	 * Tallies the elements in the given list.
	 */
	tally : function ( list )
	{
		var tally = {};
		if ( list )
		{
			for ( var i = 0, limit = list.length; i < limit; i++ )
			{
				var value = list[i];
				if ( !tally[value] )
				{
					tally[value] = 0;
				}

				tally[value]++;
			}
		}
		return tally;
	},
	
	/**
	 * Returns the sign (-1 or 1 ) of the given value.
	 */
	sign : function ( value )
	{
		return value < 0 ? -1 : 1;
	},
	
	/**
	 * Removes all children of the given div.
	 */
	clearContent : function ( div )
	{
		// Remove all children
		while ( div.firstChild )
		{
			div.removeChild( div.firstChild );
		}
	},
	
	/**
	 * Sets the contents of the given div.
	 */
	setContent : function ( div, content )
	{
		// Remove all children
		this.clearContent( div );
		
		// Add a new child
		div.appendChild( content );
	},
	
	/**
	 * Sets the content of the given div with children
	 */
	setChildren : function( children, parent )
	{
		// Remove all children
		this.clearContent( parent );
		
		for ( var i = 0, limit = children.length; i < limit; i++ )
		{
			parent.appendChild( children[ i ] );
		}
	},
	
	/**
	 * Returns the size of the given text using the TextMeasurerDiv and the font style.
	 */
	stringSizeHTML : function( string )
	{
		string = string.replace( / /g, '&nbsp;' );
		var element = document.getElementById( TextMeasurerDivId );
		element.innerHTML = string;
//		element.style.font = fontStyle;
		
		return { width : element.offsetWidth, height : element.offsetHeight };
	},
	
	/**
	 * Draws a projected rectangle and fills it with the given fillStyle. Border lines are
	 * not drawn.
	 * Bounding points example:
	 * var points = [ 	{ x:bounds.minx, y:bounds.miny, z:0 },
				   		{ x:bounds.maxx, y:bounds.miny, z:0 },
				   		{ x:bounds.maxx, y:bounds.maxy, z:0 },
				   		{ x:bounds.minx, y:bounds.maxy, z:0 } ];   
	 */
	rectangle : function( ctx, boundingPoints, projection )
	{		
		var points = boundingPoints;

		ctx.beginPath();
		for ( var i = 0, limit = points.length; i < limit; i++ )
		{
			var point = projection.project( points[i] );
			if ( i == 0 )
			{
				ctx.moveTo( point.x, point.y );
			}
			else
			{
				ctx.lineTo( point.x, point.y );
			}
		}
		
		ctx.closePath();		
	},
	
	/**
	 * Replaces all spaces with their HTML code. If the string is null or undefined it becomes
	 * an empty string.
	 */
	toHTML : function ( string )
	{
		if ( string )
		{
			string = string.replace( / /g, '&nbsp;' );						
		}
		else
		{
			string = '';
		}
					
		return string;
	},
	
	/**
	 * Returns true if the event was a right button click, false otherwise. Use on mousedown event.
	 */
	isRightClick : function( event )
	{
		var rightClick;
		if ( event.which )
		{
			rightClick = ( event.which === 3 ); // NS
		}
		else if ( event.button )
		{
			rightClick = ( event.button === 2 ); // W3C & MS
		}
		
		return rightClick;
	},
	
	/**
	 * Returns true if the event was a left button click, false otherwise. Use on mousedown event.
	 */
	isLeftClick : function( event )
	{
		var leftClick;
		if ( event.which )
		{
			leftClick = ( event.which === 1 ); // NS
		}
		else if ( event.button )
		{
			leftClick = ( event.button === 0 || event.button === 1 ); // W3C || MS
		}
		
		return leftClick;
	},
	
	/**
	 * Returns true if the event was a middle button click, false otherwise. Use on mousedown event.
	 */
	isMiddleClick : function( event )
	{
		var middleClick;
		if ( event.which )
		{
			middleClick = ( event.which === 2 ); // NS
		}
		else if ( event.button )
		{
			middleClick = ( event.button === 1 || event.button === 4 ); // W3C || MS
		}
		
		return middleClick;
	},
	
	/**
	 * Returns the length of a 3D vector. Call with care as uses sqrt.
	 */
	vectorLength3D : function( v )
	{
		return Math.sqrt( v.x * v.x + v.y * v.y + v.z * v.z );
	},
	
	/**
	 * Returns true if this browser supports HTML5 Canvas.
	 */
	supportsHTML5Canvas : function ()
	{
	    return !!document.createElement('canvas').getContext;
	},
	
	/**
	 * Parses the parameters in the given URL as a Javascript object.
	 */
	parseUrlParameters : function ( url )
	{
		var params = {};
		var idx = url.indexOf( '?' );
		if ( idx > -1 )
		{
			var paramString = url.substr( idx + 1 );
			var paramArray = paramString.split( '&' );
			for ( var i = 0, ilimit = paramArray.length; i < ilimit; i++ )
			{
				var param = paramArray[i];
				var eq = param.indexOf( '=' );
				
				if ( eq > -1 )
				{
					params[ param.slice( 0, eq ) ] = param.slice( eq + 1 );
				}
				else
				{
					params[ param ] = null;
				}
			}
		}
		return params;
	},
	
	/**
	 * Checks if a point is inside a given zone, including the boundary lines.
	 */
	isInZone : function ( dp, zone, boundsObj )
	{
		if ( zone )
		{
			var bounds = boundsObj; 
			if ( !bounds )
			{ 
				bounds = this.getZoneBounds( zone );
			}
			
	 		return dp.x >= bounds.minx && dp.x <= bounds.maxx &&
	 		       dp.y >= bounds.miny && dp.y <= bounds.maxy;
		}
		else
		{
			return false;
		}
	},
	
	/**
	 * This function obtains the world bounds (minx, miny, maxx, maxy) for the given zone.
	 */
	getZoneBounds : function ( zone )
	{
		var x0 = zone.pos.origin.x;
		var y0 = zone.pos.origin.y;
		var x1 = zone.pos.origin.x + ( zone.pos.delta.x * zone.size.height );
		var y1 = zone.pos.origin.y + ( zone.pos.delta.y * zone.size.width );
		
		// Create bounds, where x/y0 are always less than x/y1
		var bounds = {};
		if ( x0 < x1 )
		{
			bounds.minx = x0;
			bounds.maxx = x1;
		}
		else
		{
			bounds.minx = x1;
			bounds.maxx = x0;
		}
			
		if ( y0 < y1 )
		{
			bounds.miny = y0;
			bounds.maxy = y1;
		}
		else
		{
			bounds.miny = y1;
			bounds.maxy = y0;
		}
		return bounds;
	},
	
	/**
	 * Renders a given zone.
	 */
	renderZone : function ( zone, ctx, projection, strokeFlag, lineColor, lineWidth, fillColor )
	{
		if ( zone )
		{
			ctx.save();

			var bounds = this.getZoneBounds( zone );
			
			var points = [ { x:bounds.minx, y:bounds.miny, z:0 },
						   { x:bounds.maxx, y:bounds.miny, z:0 },
						   { x:bounds.maxx, y:bounds.maxy, z:0 },
						   { x:bounds.minx, y:bounds.maxy, z:0 } ];
			
			PULSE.Graphing.drawRealRectangle( points, projection, ctx, fillColor, lineColor, lineWidth, strokeFlag );

			ctx.restore();
		}
	},
	
	/**
	 * Creates an array of 2 element arrays that represent lines between given points.
	 */
	createLinesBetweenPoints : function( points )
	{
		var lines = [];
		if ( points && points.length > 1 )
		{
			for ( var i = 0, limit = points.length - 1; i < limit; i++ )
			{
				lines.push( [ points[ i ], points[ i+1 ] ] ); 
			}
		}
		return lines;
	},
	
	/** Converts a metric value to imperial units. */
	metricToImperial : function( metricVal )
	{
		var inches = Math.round( metricVal / 0.0254 );
		
		var feet = inches / 12;
		inches = inches % 12;
		
		feet = parseInt( feet );
		inches = parseInt( inches );
		
		var imperial = '';
		
		if ( feet > 0 )
		{
			imperial += feet + '\'';
		}
		
		imperial += inches + '\'\'';
		
		return imperial;
	},

	/** Converts pulse font object to usablecanvas font string */
	fontToString : function ( font )
	{
		var string = "";
		
		var fontArray = [];

		fontArray.push( font['font-weight'] || '' );
		
		fontArray.push( font['font-size'] ? font['font-size'] + 'px' : '' );
		
		fontArray.push( font['font-family'] || '' );
		
		return fontArray.join(" ");
	},
	
	/** gets the value of a font from a canvas font string */
	fontSizeToString : function ( fontString )
	{
		var array = fontString.split(' ');
		
		for( var i = 0; i < array.length; i++ )
		{
			var number = array[i];
			
			number = number.split('px').join('');
			
			number = +number;
			
			if( !isNaN( number ) )return number;
		}
	},
	
	pixelStringToNumber : function( string )
	{
		var numberString = string.replace( 'px', '' );
		
		return +numberString;
	},

	numberToPixelString : function( number )
	{
		return number + 'px';
	},
	
	/** takes first char of a string andmakes it uppercase */
	capitalise : function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
};

/**
 * The Cricket Hawkeye Record field 'enum'.
 */
var CricketField = 
{
	BATSMAN 		: 0,
	BOWLER 			: 1,
	INNINGS			: 2,
	OVER			: 3,
	BALL			: 4,
	ID				: 5,
	WW				: 6,
	RUNS			: 7,
	CREDIT      	: 8,
	DEBIT       	: 9,
	PITCHED			: 10,
	IS_WICKET		: 11,
	STUMPS			: 12,
	TRAJECTORY		: 13,
	BOWL_SPEED  	: 14,
	HAS_HANDEDNESS 	: 15,
	HANDEDNESS		: 16,
	IS_COUNTING		: 17,
	DISMISSED		: 18,
	NF_BATSMAN		: 19,
	WIN_LIKELIHOODS : 20,
	BOWLER_SPEED	: 21,
	PITCH_SEGMENT   : 22,
	COUNTING_BALL	: 23,
	EXTRA_TYPE		: 24
};

/**
 * Match type enum. Maps directly to HEDB enum type.
 */
var CricketMatchType = { TEST:0, ODI:1, T20:2 };

/**
 * Delivery type enum. Maps directly to HEDB enum type; not supported in UDS.
 */
var CricketDeliveryType = { OVER:0, ROUND:1 }; 

/**
 * Shot style enum. In HEDB this is composited with shot type.
 */
var CricketShotStyle = { ATTACK:0, DEFEND:1, NOSHOT:2 };

/**
 * Shot type enum. In HEDB this is composited with shot style.
 */
var CricketShotType = { PLAYED:0, EDGED:1, NOSHOT:2, MISSED:3 };

/**
 * Extra type enum. Note that HEDB is missing the last two of these, but otherwise the
 * mapping is to the HEDB enum.
 */
var CricketExtraType = { NONE:0, WIDE:1, BYE:2, LEGBYE:3, NOBALL:4, NOBALLBYE:5, NOBALLLEGBYE:6 };

/**
 * Batsman handedness enum. Maps directly to HEDB enum.
 */
var CricketHandedness = { LEFT:0, RIGHT:1 };

/**
 * Bowling style enum. UDS will infer this from speed, and only the first two are supported.
 * The values map directly to the HEDB enum.
 */
var CricketBowlerSpeed = { SPIN:0, SEAM:1, BOTH:2, MEDIUM:3, NOBOWL:4 };

/**
 * Constants that have special meaning in the filtering of data.
 */
var CricketFilter = { ALL:'All', LEFTHANDERS:'Left-handers', RIGHTHANDERS:'Right-handers',
				 	  SPINBOWLERS:'Spin bowlers', SEAMBOWLERS:'Seam bowlers', 
				 	  WATCHLIVE:'Watch live', ALLINOVER:'All in over', ALLBOWLERS:'All Bowlers',
				 	  ALLBALLS:'All Balls', ALLBATSMEN:'All Batsmen' };

/**
 * Segment description lookups.
 */
var CricketSegmentLookup = { 'BO':'backward of square on the off side', 
							 'C' :'through the covers', 
							 'S' :'straight down the ground', 
							 'M' :'through mid-wicket', 
							 'BL':'backward of square on the leg side' }; 

// Name of the text measurement div
var TextMeasurerDivId = 'PULSE.textmeasurer';

if ( !PULSE ) { var PULSE = {}; }

/**
 * Class to encapsulate a ball progress.
 */
PULSE.BallProgress = function ( rawBp )
{
	var fields = rawBp.split( '.' );
	this.innings = fields[0];
	this.over = fields[1];
	
	if ( fields.length > 2 )
	{
		this.ball = fields[2];
	}
};

PULSE.BallProgress.matches = function ( raw )
{
	return !Utils.isNullish( raw ) && raw.match( /\d+\.\d+\.\d+/ ) !== null;
};

PULSE.BallProgress.prototype.description = function ()
{
	return this.innings + '.' + this.over + '.' + this.ball;
};

PULSE.BallProgress.prototype.compareTo = function ( rawBp )
{
	var other = new PULSE.BallProgress( rawBp );
	
    var compare = +this.innings - +other.innings;
    if ( compare === 0 )
    {
        compare = +this.over - +other.over;
        if ( compare === 0 )
        {
            compare = +this.ball - +other.ball;
        }
    }

    return compare;
};

/**
 * Data type for a cricket ball trajectory. Parsers up-stream handle parsing from the various
 * different source formats.
 */
function CricketBallTrajectory()
{
}

/**
 * Gets the ball position at a particular time.
 */
CricketBallTrajectory.prototype.getPositionAtTime = function ( t )
{
	var time = t - this.bt;

    if ( time > 0 )
    {
    	return { x: this.getX( this.bp.x, this.obv.x, this.oba.x, time ),
    		     y: this.getYorZ( this.bp.y, this.obv.y, this.oba.y, time ),
    			 z: this.getYorZ( this.bh, this.obv.z, this.oba.z, time ) };
    }
    else
    {
    	return { x: this.getX( this.bp.x, this.ebv.x, this.a.x, time ),
    			 y: this.getYorZ( this.bp.y, this.ebv.y, this.a.y, time ),
    			 z: this.getYorZ( this.bh, this.ebv.z, this.a.z, time ) };
    }
};
	
/**
 * Gets the time at a particular X position.
 */
CricketBallTrajectory.prototype.getTimeAtX = function ( x )
{
    if ( this.bp.x > x )
    {
    	return Math.log( ( ( x - this.bp.x ) * ( this.oba.x / this.obv.x ) ) + 1 ) / this.oba.x;
    }
    else
    {
    	return Math.log( ( ( x - this.bp.x ) * ( this.a.x / this.ebv.x ) ) + 1 ) / this.a.x;
    }
};
	
/**
 * Gets the x value at a specific time.
 */
CricketBallTrajectory.prototype.getX = function ( x, vx, ax, t )
{
    return x - ( vx * ( ( 1 - Math.exp( ax * t ) ) / ax ) );
};
    
/**
 * Gets the y or z values at a specific time.
 */
CricketBallTrajectory.prototype.getYorZ = function ( pos, velocity, accel, t )
{
    return pos + ( velocity * t ) + ( ( accel * t * t ) / 2 );
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.GraphProvider = function ()
{
	this.dbType = 'UdsHawkeyeDatabase';
	this.resync();
};

/**
 * Sets the match type and DB type for this provider to use.
 */
PULSE.GraphProvider.prototype.setEnvironment = function ( matchType, dbType )
{
	PULSE.Tracer.info( 'setEnvironment matchType=' + matchType + ' dbType=' + dbType );
	
	if ( this.matchType !== matchType || this.dbType !== dbType )
	{
		this.matchType = matchType;
		this.dbType = dbType;
		this.resync();
	}
};

/**
 * Gets all available graph names for the current environment.
 */
PULSE.GraphProvider.prototype.getAvailableGraphs = function ()
{
	return this.graphNames;
};

/**
 * Returns the currently selected graph.
 */
PULSE.GraphProvider.prototype.current = function ()
{
	if ( this.index >= this.graphNames.length || this.index < 0 )
	{
		return undefined;
	}
	else
	{
		return this.graphNames[ this.index ];
	}
};

/**
 * Returns the next graph in the list of graph names. Can be undefined if there are no
 * available graphs.
 */
PULSE.GraphProvider.prototype.next = function ()
{
	this.index++;
	if ( this.index >= this.graphNames.length )
	{
		this.index = 0;
	}
	return this.current();
};

/**
 * Returns the previous graph in the list of graph names. Can be undefined if there are no
 * available graphs.
 */
PULSE.GraphProvider.prototype.previous = function ()
{
	this.index--;
	if ( this.index < 0 )
	{
		this.index = this.graphNames.length - 1;
	}
	return this.current();
};

PULSE.GraphProvider.prototype.currentGraphIdx = function() {

	var current 	= this.current();
	var available 	= this.getAvailableGraphs();
	
	for(var i = 0; i < available.length; i++) {
		
		var graph = available[i];
		
		if(graph === current)
		{
			return i;
		}
	}
	
	return -1;
	
};


PULSE.GraphProvider.prototype.graphIdxByName = function(name) {
	var available 	= this.getAvailableGraphs();
	
	for(var i = 0; i < available.length; i++) {
		
		var graph = available[i];
		
		if(graph === name)
		{
			return i;
		}
	}
	
	return -1;
};

/**
 * Resync the list of available graph names supported in the current environment.
 */
PULSE.GraphProvider.prototype.resync = function ()
{
	this.graphNames = [];

	this.graphNames.push( 'Trajectory Viewer' );
	this.index = this.graphNames.length - 1;
	
	// Those also supported in limited overs
	if ( CricketMatchType.TEST !== this.matchType )
	{
		this.graphNames.push( 'Runs Per Over' );
		this.graphNames.push( 'Worms' );
	}

	// Graphs always supported
	this.graphNames.push( 'Speed Pitch Map' );
	this.graphNames.push( 'Bowl Speeds' );

	this.graphNames.push( 'Wagon Wheel' );
	this.graphNames.push( 'Pitch Map' );
	this.graphNames.push( 'Beehive Placement' );
	this.graphNames.push( 'Pitch Map Mountain' );
	this.graphNames.push( 'Partnerships' );
	this.graphNames.push( 'Variable Bounce' );
	this.graphNames.push( 'Run Rate' );
	
	// Iterate over array, removing graphs that have browser-specific exclusions
	if ( PULSE.Browser && PULSE.Browser.getExcludedGraphs )
	{
		var exclusions = PULSE.Browser.getExcludedGraphs();
		var newGraphs = [];
		for ( var i = 0, ilimit = this.graphNames.length; i < ilimit; i++ )
		{
			if ( !Utils.isInArray( exclusions, this.graphNames[i] ) )
			{
				newGraphs.push( this.graphNames[i] );
			}
		}
		this.graphNames = newGraphs;
	}
	
	PULSE.Tracer.info( 'Available graphs are now: ' + this.graphNames );
};

PULSE.GraphProvider.prototype.syncTo = function ( name )
{
	for ( var i = 0, j = this.graphNames.length; i < j; i++ )
	{
		if ( name === this.graphNames[i] )
		{
			this.index = i;
			break;
		}
	}
};

if ( !PULSE ) { var PULSE = {}; }

/*************/
/* Pitch Map */
/*************/

PULSE.RaphaelPitchMapRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelPitchMapRenderer.isSameCategory = function ( a, b )
{
	return ( a === b || ( a >= 1 && a <= 3 && b >= 1 && b <= 3 ) || ( a >= 4 && b >= 4 ) );
};

PULSE.RaphaelPitchMapRenderer.prototype.isValid = function ( row )
{
	return true;
};

PULSE.RaphaelPitchMapRenderer.prototype.render = function ( db, data, ctx )
{
	this.db = db;
	this.data = this.prepareData( data );
	this.ctx = ctx;
	
	this.tooltipData = undefined;
	this.draw();
};

PULSE.RaphaelPitchMapRenderer.prototype.getColorKey = function ( row )
{
	return row.get( CricketField.IS_WICKET ) ? 'w' : row.get( CricketField.DEBIT );
};

PULSE.RaphaelPitchMapRenderer.prototype.compare = function ( a, b )
{
	var aw = a.get( CricketField.IS_WICKET );
	var bw = b.get( CricketField.IS_WICKET );
	
	if ( aw && !bw )
	{
		return 1;
	}
	else if ( !aw && bw )
	{
		return -1;
	}
	else
	{
		var ar = +a.get( CricketField.DEBIT );
		var br = +b.get( CricketField.DEBIT );

		if ( PULSE.RaphaelPitchMapRenderer.isSameCategory( ar, br ) )
		{
			if ( a.get( CricketField.PITCHED ) !== undefined && b.get( CricketField.PITCHED ) !== undefined )
			{
				return ( +a.get( CricketField.PITCHED ).x ) - ( +b.get( CricketField.PITCHED ).x );
			}
		}
		else
		{
			return ar - br;
		}
	}
	return 0;
};

/**
 * This function sorts and projects the balls passed in. It results in an array
 * of objects that each have a ball.x/y, a shadow.x/y and a color. It also sets the background image
 * appropriately. 
 */
PULSE.RaphaelPitchMapRenderer.prototype.prepareData = function ( data )
{
	this.tooltipDataCache = {};

	// Need to clone the array, so we can sort on BounceX
	var dataArray = Utils.cloneArray( data );
	
	// Sort the array; also track handedness so we don't need to iterate again
	var hasRight = false;
	var hasLeft = false;
	var that = this;
	
	dataArray.sort( function ( a, b ) 
	{
		var handedness = a.get( CricketField.HANDEDNESS );
		if ( !hasRight && CricketHandedness.RIGHT === handedness )
		{
			hasRight = true;
		}
		if ( !hasLeft && CricketHandedness.LEFT === handedness )
		{
			hasLeft = true;
		}
		
		return that.compare( a, b );
	} );
	
	// Set background based upon hasLeft/hasRight
	if ( hasLeft && hasRight )
	{
		this.controller.setBackground( this.config.variants.mix.background );
	}
	else if ( hasLeft )
	{
		this.controller.setBackground( this.config.variants.lh.background );
	}
	else if ( hasRight )
	{
		this.controller.setBackground( this.config.variants.rh.background );
	}
	
	// Iterate through sorted balls
	var preparedData = [];
	for ( var i = 0, j = dataArray.length; i < j; i++ )
	{
		var row = dataArray[i];
		var xyz = row.get( CricketField.PITCHED );
		if ( xyz !== undefined )
		{
			xyz = this.db.normalise( xyz );
			
			if ( xyz.x > -999 && xyz.y > -999 && this.isValid( row ) )
			{
				var shadow = this.config.projection.project( xyz );
				xyz.z = 0.036;
				var ball = this.config.projection.project( xyz );
								
				if ( hasLeft && hasRight )
				{
					if ( CricketHandedness.LEFT === row.get( CricketField.HANDEDNESS ) )
					{
						shadow.x += this.config.variants.lh.offset;
						ball.x += this.config.variants.lh.offset;
					}
					else
					{
						shadow.x += this.config.variants.rh.offset;
						ball.x += this.config.variants.rh.offset;
					}
				}
				
				shadow.x -= 3;
				shadow.y += 1;
				
				var colorKey = this.getColorKey( row );
				preparedData.push( { ball:ball, shadow:shadow, color:this.config.colors[ colorKey ] } );

				this.updateTooltipCache( ball, row );
			}
		}
	}
	
	return preparedData;
};

PULSE.RaphaelPitchMapRenderer.prototype.updateTooltipCache = function ( ball, row )
{
	// Update tooltip cache
	var ix = Math.round( ball.x );
	var iy = Math.round( ball.y );				
	var tx = this.tooltipDataCache[ ix ];
	if ( tx === undefined )
	{
		tx = {};
		this.tooltipDataCache[ ix ] = tx;
	}
	
	var lines = [];
	lines.push( '<c:#bbb>Ball </c>' + row.get( CricketField.INNINGS ) + '.' + 
			( +row.get( CricketField.OVER ) - 1 ) + '.' +
			row.get( CricketField.COUNTING_BALL ) );
	lines.push( row.get( CricketField.BOWLER ) + 
			' <c:#bbb>to </c>' + row.get( CricketField.BATSMAN ) );
	
	var line3 = '';
	
	var bs = row.get( CricketField.BOWL_SPEED );
	if ( !Utils.isNullish( bs ) && +bs >= 40 )
	{
        if ( PULSE.SpeedModeController.mode === PULSE.SpeedModeController.MODE_KMH )
        {
        	bs = PULSE.SpeedModeController.mphToKmh( bs );
        }
        
        line3 += +bs.toFixed(1) + PULSE.SpeedModeController.unit;
	}
	
	var summary = row.generateSummary();
	if ( !Utils.isNullish( summary ) )
	{
		if ( line3.length > 0 )
		{
			line3 += ' <c:#bbb>resulting in </c>';
		}
		line3 += summary;
	}
	
	if ( !Utils.isNullish( line3 ) )
	{
		lines.push( line3 );
	}
	
	lines.push( '<c:#888>Click to view trajectory</c>' );
	
	var ttd = { lines:lines, x:ix, y:iy, bp:row.get( CricketField.ID ) };
	this.tooltipDataCache[ ix ][ iy ] = ttd;
};

PULSE.RaphaelPitchMapRenderer.prototype.draw = function () 
{
	// Parse ball size
	var sz = this.config.ballSize;
	var idx = this.config.ballSize.indexOf('px');
	if ( idx !== -1 )
	{
		sz = +( this.config.ballSize.substr( 0, idx ) );
	}
	sz /= 2;
	
	// Clear paper
	this.ctx.r.clear();

	// Add all shadows (pushing them to the back) and balls
	for ( var i = 0, j = this.data.length; i < j; i++ )
    {
	    this.ctx.r.ellipse( this.data[i].shadow.x, this.data[i].shadow.y, sz, sz * 0.6 )
                  .attr( { fill:'black', opacity:0.3, stroke:'none' } ); 
    }
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		var img = 'images/balls/' + this.config.ballSize + '/phe_' + this.data[i].color + '_ball.png';
		this.ctx.r.image( img, this.data[i].ball.x - sz, this.data[i].ball.y - sz, sz * 2, sz * 2 );
	}
};

PULSE.RaphaelPitchMapRenderer.prototype.updateTooltip = function ()
{
	if ( this.tooltipData )
	{
		// Remove any current tooltip set
		if ( this.ttSet )
		{
			try
			{
				this.ttSet.remove();
			}
			catch ( exception )
			{
				// Potentially tries to remove an object already cleared
			}
		}
		
		var cfg = this.config.tooltip;
		var anchorv = 'n';
		var anchorh = 'w';
		
		if ( this.tooltipData.x > this.config.width / 2 )
		{
			anchorh = 'e';
		}
		if ( this.tooltipData.y > this.config.height / 2 )
		{
			anchorv = 's';
		}
		
		cfg.position = { x:this.tooltipData.x, y:this.tooltipData.y, anchor:anchorv + anchorh };

		// Create a new set and build Raphael object stack for a text field in it
		this.ttSet = this.ctx.r.set();
		var tf = new PULSE.RaphaelTextField( cfg );
		tf.setLines( this.tooltipData.lines );
		tf.render( this.ctx.r, this.ttSet );
	}
	else
	{
		this.ttSet.animate( { opacity:0 }, 1000 );
	}
};

PULSE.RaphaelPitchMapRenderer.prototype.onMouse = function ( event )
{
	// Get XY and then infer ball
	var xy = Utils.getXY( event );
	if ( xy !== undefined )
	{
		var tooltipData = this.findNearbyTooltip( xy );
		if ( 'mousedown' === event.type )
		{
			if ( tooltipData !== undefined )
			{
				this.controller.showTrajectory( tooltipData.bp );
				return;
			}
		}
	}
	
	if ( this.tooltipData !== tooltipData )
	{
		this.tooltipData = tooltipData;
		this.updateTooltip();
	}
};

PULSE.RaphaelPitchMapRenderer.prototype.findNearbyTooltip = function ( xy )
{
	for ( var s = 0; s < 4; s++ )
	{
		for ( var x = xy.x - s; x <= xy.x + s; x++ )
		{
			for ( var y = xy.y - s; y <= xy.y + s; y++ )
			{
				if ( this.tooltipDataCache[ x ] !== undefined &&
					 this.tooltipDataCache[ x ][ y ] !== undefined )
				{
					return this.tooltipDataCache[ x ][ y ];
				}
			}
		}
	}
};

/*******************/
/* Variable Bounce */
/*******************/

PULSE.RaphaelVariableBounceRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelVariableBounceRenderer.prototype.getColorKey = function ( row )
{
	var stumps = row.get( CricketField.STUMPS );
	if ( row.get( CricketField.IS_WICKET ) )
	{
		return 'w';
	}
	else if ( stumps.z > 0.745 )
	{
		return 'a';
	}
	else
	{
		return 's';
	}
};

PULSE.RaphaelVariableBounceRenderer.prototype.render = PULSE.RaphaelPitchMapRenderer.prototype.render;
PULSE.RaphaelVariableBounceRenderer.prototype.onMouse = PULSE.RaphaelPitchMapRenderer.prototype.onMouse;
PULSE.RaphaelVariableBounceRenderer.prototype.updateTooltip = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltip;
PULSE.RaphaelVariableBounceRenderer.prototype.findNearbyTooltip = PULSE.RaphaelPitchMapRenderer.prototype.findNearbyTooltip;
PULSE.RaphaelVariableBounceRenderer.prototype.updateTooltipCache = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltipCache;
PULSE.RaphaelVariableBounceRenderer.prototype.prepareData = PULSE.RaphaelPitchMapRenderer.prototype.prepareData;

PULSE.RaphaelVariableBounceRenderer.prototype.isValid = function ( row )
{
	var pitched = row.get( CricketField.PITCHED );
	var stumps = row.get( CricketField.STUMPS );
	
	if ( pitched !== undefined && stumps !== undefined )
	{
		var xyz = { x:pitched.x, y:pitched.y, z:stumps.z };
		xyz = this.db.normalise( xyz );
		
		return xyz.x > -999 && xyz.y > -999 && xyz.z > -999;
	}
	
	return false;
};

PULSE.RaphaelVariableBounceRenderer.prototype.compare = function ( a, b )
{
	var aw = a.get( CricketField.IS_WICKET );
	var bw = b.get( CricketField.IS_WICKET );
	
	if ( aw && !bw )
	{
		return 1;
	}
	else if ( !aw && bw )
	{
		return -1;
	}
	else
	{
		if ( a.get( CricketField.PITCHED ) !== undefined && b.get( CricketField.PITCHED ) !== undefined )
		{
			return +a.get( CricketField.PITCHED ).x - +b.get( CricketField.PITCHED ).x;
		}
	}
	return 0;
};

PULSE.RaphaelVariableBounceRenderer.prototype.draw = PULSE.RaphaelPitchMapRenderer.prototype.draw;
PULSE.RaphaelVariableBounceRenderer.prototype.updateTooltipCache = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltipCache;

/*******************/
/* Speed Pitch Map */
/*******************/

PULSE.RaphaelSpeedPitchMapRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelSpeedPitchMapRenderer.prototype.getColorKey = function ( row )
{
	var speed = +row.get( CricketField.BOWL_SPEED );
	
	// Convert the speed unit
    if ( PULSE.SpeedModeController.mode === PULSE.SpeedModeController.MODE_KMH )
    {
    	speed = PULSE.SpeedModeController.mphToKmh( speed );
    }
	
	for ( var b = 0, c = this.config.buckets.length; b < c; b++ )
	{
		if ( speed < this.config.buckets[b] )
		{
			return b;
		}
	}
	
	return this.config.buckets.length;
};

PULSE.RaphaelSpeedPitchMapRenderer.prototype.render = PULSE.RaphaelPitchMapRenderer.prototype.render;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.onMouse = PULSE.RaphaelPitchMapRenderer.prototype.onMouse;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.updateTooltip = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltip;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.findNearbyTooltip = PULSE.RaphaelPitchMapRenderer.prototype.findNearbyTooltip;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.updateTooltipCache = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltipCache;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.prepareData = PULSE.RaphaelPitchMapRenderer.prototype.prepareData;

PULSE.RaphaelSpeedPitchMapRenderer.prototype.isValid = function ( row )
{
	var bs = row.get( CricketField.BOWL_SPEED );
	return !Utils.isNullish( bs ) && +bs >= 40;
};

PULSE.RaphaelSpeedPitchMapRenderer.prototype.compare = function ( a, b )
{
	if ( a.get( CricketField.PITCHED ) !== undefined && b.get( CricketField.PITCHED ) !== undefined )
	{
		return ( +a.get( CricketField.PITCHED ).x ) - ( +b.get( CricketField.PITCHED ).x );
	}
	return 0;
};

PULSE.RaphaelSpeedPitchMapRenderer.prototype.draw = PULSE.RaphaelPitchMapRenderer.prototype.draw;
PULSE.RaphaelSpeedPitchMapRenderer.prototype.updateTooltipCache = PULSE.RaphaelPitchMapRenderer.prototype.updateTooltipCache;

/**********************/
/* Pitch Map Mountain */
/**********************/

PULSE.RaphaelPitchMapMountainRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.bucketise = function ( x, y )
{
	if ( x >= this.config.boundary.x.min && x <= this.config.boundary.x.max &&
		 y >= this.config.boundary.y.min && y <= this.config.boundary.y.max )
	{
		return { x : Math.floor( ( x - this.config.boundary.x.min ) / this.config.bucketSize ),
			     y : Math.floor( ( y - this.config.boundary.y.min ) / this.config.bucketSize ) };
	}
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.render = function ( db, data, ctx )
{
	this.projectedPoints = {};

	this.ctx = ctx;
	this.db = db;
	
	ctx.r.clear();
	
	var bubble1 = Math.sqrt( 8 ) / 3;
	var bubble2 = Math.sqrt( 7 ) / 3;
	var bubble3 = Math.sqrt( 5 ) / 3;
	var bubble4 = 2 / 3;
	var bubble5 = 1 / 3;
	
	// Bucketise the data
	var heights = {};
	var total = 0;
	for ( var i = 0, j = data.length; i < j; i++ )
	{
		var row = data[i];
		var xyz = row.get( CricketField.PITCHED );
		
		if ( xyz !== undefined )
		{
			var bucket = this.bucketise( xyz.x, xyz.y );
			if ( bucket !== undefined )
			{
				var x = bucket.x;
				var y = bucket.y;
				// Centre point
				this.incrementBucket( heights, x, y, 1 );
				// Points one unit away
				this.incrementBucket( heights, x - 1, y, bubble1 );
				this.incrementBucket( heights, x + 1, y, bubble1 );
				this.incrementBucket( heights, x, y - 1, bubble1 );
				this.incrementBucket( heights, x, y + 1, bubble1 );
				// Points two steps away (diagonally)
				this.incrementBucket( heights, x - 1, y - 1, bubble2 );
				this.incrementBucket( heights, x - 1, y + 1, bubble2 );
				this.incrementBucket( heights, x + 1, y - 1, bubble2 );
				this.incrementBucket( heights, x + 1, y + 1, bubble2 );
				// Points two steps away (linearly)
				this.incrementBucket( heights, x - 2, y, bubble3 );
				this.incrementBucket( heights, x + 2, y, bubble3 );
				this.incrementBucket( heights, x, y - 2, bubble3 );
				this.incrementBucket( heights, x, y + 2, bubble3 );
				// Points three steps away
				this.incrementBucket( heights, x - 2, y + 1, bubble4 );
				this.incrementBucket( heights, x - 2, y - 1, bubble4 );
				this.incrementBucket( heights, x + 2, y + 1, bubble4 );
				this.incrementBucket( heights, x + 2, y - 1, bubble4 );
				this.incrementBucket( heights, x - 1, y + 2, bubble4 );
				this.incrementBucket( heights, x + 1, y + 2, bubble4 );
				this.incrementBucket( heights, x - 1, y - 2, bubble4 );
				this.incrementBucket( heights, x + 1, y - 2, bubble4 );
				// Points four steps away
				this.incrementBucket( heights, x - 2, y - 2, bubble5 );
				this.incrementBucket( heights, x - 2, y + 2, bubble5 );
				this.incrementBucket( heights, x + 2, y - 2, bubble5 );
				this.incrementBucket( heights, x + 2, y + 2, bubble5 );

				total++;
			}
		}
	}

	var triangles = [];
	
	if ( total > 0 )
	{
		var xs = ( this.config.boundary.x.max - this.config.boundary.x.min ) / this.config.bucketSize;
		var ys = ( this.config.boundary.y.max - this.config.boundary.y.min ) / this.config.bucketSize;
		
		// Quickly loop over all the points and work out the max height
		var maxHeight = 0;
		for ( var x = 0; x <= xs; x++ )
		{
			for ( var y = 0; y <= ys; y++ )
			{
				maxHeight = Math.max( maxHeight, this.getHeight( heights, x, y ) );
			}
		}
		if ( maxHeight == 0 )
		{
			maxHeight = 1;
		}
		
		maxHeight /= this.config.maxHeight;
		
		for ( var x = 0; x <= xs; x++ )
		{
			var xpos1 = this.config.boundary.x.min + ( x * this.config.bucketSize );
			var xpos2 = xpos1 + this.config.bucketSize;
			for ( var y = 0; y <= ys; y++ )
			{
				var ypos1 = this.config.boundary.y.min + ( y * this.config.bucketSize );
				var ypos2 = ypos1 + this.config.bucketSize;
				
				// Get the height at the four corners
				var height1 = this.getHeight( heights, x, y ) / maxHeight;
				var height2 = this.getHeight( heights, x + 1, y ) / maxHeight;
				var height3 = this.getHeight( heights, x, y + 1 ) / maxHeight;
				var height4 = this.getHeight( heights, x + 1, y + 1 ) / maxHeight;
				
				// Triangle 1
				if ( height2 > 0 || height3 > 0 || height4 > 0 )
				{
					triangles.push( {
						p1 : { x: xpos2, y: ypos1, z: height2 },
						p2 : { x: xpos2, y: ypos2, z: height4 },
						p3 : { x: xpos1, y: ypos2, z: height3 }
					} );
				}
				
				// Triangle 2
				if ( height1 > 0 || height2 > 0 || height3 > 0 )
				{
					triangles.push( {
						p1 : { x: xpos1, y: ypos1, z: height1 },
						p2 : { x: xpos2, y: ypos1, z: height2 },
						p3 : { x: xpos1, y: ypos2, z: height3 }
					} );
				}
			}
		}
		
		this.renderMesh( triangles );
	}
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.incrementBucket = function ( heights, x, y, amount )
{
	if ( heights[ x ] === undefined )
	{
		heights[ x ] = {};
	}
	if ( heights[ x ][ y ] === undefined )
	{
		heights[ x ][ y ] = 0;
	}

	heights[ x ][ y ] += amount;
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.getHeight = function ( heights, x, y )
{
	var height = 0;
	if ( heights[ x ] !== undefined && heights[ x ][ y ] !== undefined )
	{
		height = heights[ x ][ y ];
	}
	return height;
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.renderMesh = function ( triangles )
{
	for ( var i = 0, limit = triangles.length; i < limit; i++ )
	{
		var triangle = triangles[ i ];
		
		var p1 = this.db.normalise( { x:triangle.p1.x, y:triangle.p1.y, z:triangle.p1.z } );
		var p2 = this.db.normalise( { x:triangle.p2.x, y:triangle.p2.y, z:triangle.p2.z } );
		var p3 = this.db.normalise( { x:triangle.p3.x, y:triangle.p3.y, z:triangle.p3.z } );
		
		var d1 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
		var d2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
		
		// Calculate the normal vector for the triangle using the cross product
		var crossProduct = { x: d1.y * d2.z - d1.z * d2.y,
				             y: d1.z * d2.x - d1.x * d2.z,
				             z: d1.x * d2.y - d1.y * d2.x };
		// Work out the length of the vector
		var crossProductSize = Math.sqrt( crossProduct.x * crossProduct.x + 
				crossProduct.y * crossProduct.y + crossProduct.z * crossProduct.z );
		// Normalise the cross product vector
		crossProduct.x /= crossProductSize;
		crossProduct.y /= crossProductSize;
		crossProduct.z /= crossProductSize;
		
		// Work out the dot product of the normal and light vector to work out the angle between them
		var dotProduct = crossProduct.x * this.config.light.x + 
		                 crossProduct.y * this.config.light.y +
		                 crossProduct.z * this.config.light.z;
		
		if ( dotProduct < 0 )
		{
			// The triangle is facing away from the camera, so skip this one
			continue;
		}
		
		dotProduct = dotProduct * this.config.lightStrength + 1 - this.config.lightStrength;
		
		var color = { r : dotProduct * this.config.color.r,
				      g : dotProduct * this.config.color.g,
				      b : dotProduct * this.config.color.b };
		
		var colorString = 'rgb(' + +Math.round( color.r * 255 ) + ',' + +Math.round( color.g * 255 ) + ',' + +Math.round( color.b * 255 ) + ')';
		var pos1 = this.project( p1 );
		var pos2 = this.project( p2 );
		var pos3 = this.project( p3 );

		var pathString = 'M' + pos1.x + ' ' + pos1.y +
						 'L' + pos2.x + ' ' + pos2.y +
						 'L' + pos3.x + ' ' + pos3.y + 'z';
		
		this.ctx.r.path( pathString ).attr( { fill:colorString, stroke:colorString } );
	}
};

PULSE.RaphaelPitchMapMountainRenderer.prototype.project = function ( xyz )
{
	// This projects a world point to a screen point, but caches the result so that subsequent
	// invocations are quicker

	var key = xyz.x + ',' + xyz.y + ',' + xyz.z;
	var projected = this.projectedPoints[ key ];
	
	if ( !projected )
	{
		projected = this.config.projection.project( xyz );
		this.projectedPoints[ key ] = projected;
	}
	
	return projected;
};

if ( !PULSE ) { var PULSE = {}; }

/***************/
/* Wagon Wheel */
/***************/

PULSE.RaphaelWagonWheelRenderer = function ( config )
{
	this.config = config;
	this.selected = -1;
}

PULSE.RaphaelWagonWheelRenderer.BUCKETS = [ 0, 0, 1, 1, 2, 2, 3, 3, 3, 3 ];

PULSE.RaphaelWagonWheelRenderer.prototype.render = function ( db, data, ctx )
{
	ctx.r.clear();
	this.sets = [ ctx.r.set(), ctx.r.set(), ctx.r.set(), ctx.r.set() ];
	this.selected = -1;
	
	// Get the scales
	var yscale = this.config.scale.y;
	var xscale = this.config.scale.x;
	
	var screenOrigin = this.config.transform( 0, 0, 1 );

	var sign = db.getParameter( 'ww-sign' );
	var origin = this.config.transform( db.getParameter( 'ww-origin-x' ), 0, sign );
	
	// Stats object which is used to populate the annotated key
	var stats = { runs:0, balls:0, scoring:0, runsleg:0, runsoff:0,
				  singles:0, twothrees:0, fours:0, sixes:0 };

	// Clone the data so we can sort on number of runs; singles are nearest the top, as other
	// shots will typically be longer and poke out from underneath; the exception is that 6s
	// should appear on top of 4/5s
	var dataArray = Utils.cloneArray( data );
	
	// Sort the array
	dataArray.sort( function ( a, b ) 
	{
		var ar = +a.get( CricketField.CREDIT );
		var br = +b.get( CricketField.CREDIT );
		
		if ( ar === 6 && br >= 4 )
		{
			return ar - br;
		}
		else
		{
			return br - ar;
		}
	} );
	
	for ( var i = 0, ilimit = dataArray.length; i < ilimit; i++ )
	{
		var row = dataArray[i];
		var extraType = row.get( CricketField.EXTRA_TYPE );
		// ignore wide and wide-bye balls as they are not valid batsman-faced-balls
		if ( extraType !== "Wd" && extraType !== "WdB" )
		{
			stats.balls++;
		}
				
		var landing = row.get( CricketField.WW );
		if ( landing !== undefined && landing.x > -999 && landing.y > -999 )
		{
			var runs = ( +row.get( CricketField.CREDIT ) );
			if ( runs > 0 )
			{
				// Update stats
				stats.scoring++;
				stats.runs += runs;
				
				switch ( runs )
				{
					case 1:
						stats.singles++;
						break;
					case 2:
					case 3:
						stats.twothrees++;
						break;
					case 4:
					case 5:
						stats.fours++;
						break;
					case 6:
						stats.sixes++;
						break;
				}
				
				var lh = ( row.get( CricketField.HANDEDNESS ) === CricketHandedness.LEFT );
				if ( ( lh && landing.y < 0 ) || ( !lh && landing.y >= 0 ) )
				{
					stats.runsleg += runs;
				}
				else
				{
					stats.runsoff += runs;
				}

				// Transform to screen position
				var screenPos = this.config.transform( landing.x, landing.y, sign );
				
				// Scale to ensure 4+ runs go to the rope
				if ( runs >= 4 )
				{
					screenPos = Utils.scaleLine( origin, screenPos, 200 );
				}
				else
				{
					var len = this.config.scaleback ? this.config.scaleback.length : 170;
					var amt = this.config.scaleback ? this.config.scaleback.amount : 0.8;
					
					screenPos = Utils.scaleLineRel( origin, screenPos, len, amt );
				}

				// Check for intersection of the current line and the current clip.
				// This uses the 2D library from http://www.kevlindev.com/ (no obvious licensing issues)
				var c = { x:screenOrigin.x, y:screenOrigin.y + 2 };
			    var rx = 184 * xscale;
			    var ry = 184 * yscale;
			    var a1 = new Point2D( origin.x, origin.y );
			    var a2 = new Point2D( screenPos.x, screenPos.y );
				
				var inter = Intersection.intersectEllipseLine( c, rx, ry, a1, a2 );
			    if ( 'Intersection' === inter.status && inter.points.length > 0 )
			    {
			    	screenPos = { x:inter.points[0].x, y:inter.points[0].y };
			    } 
				
				var bucket = PULSE.RaphaelWagonWheelRenderer.BUCKETS[ runs ];
				var line = ctx.r.path( 'M' + origin.x + ' ' + origin.y + 
						               'L' + screenPos.x + ' ' + screenPos.y )
						        .attr( { stroke:this.config.colors[ runs ][1],
						       	        'stroke-width':this.config.lineWidth } );
				
				this.sets[bucket].push( line );
			}
		}
	}

	// Convert runs to leg/off to percentages
	var tot = stats.runsleg + stats.runsoff;
	if ( tot > 0 )
	{
		stats.runsleg = ( Math.round( 100 * stats.runsleg / tot ) );
		stats.runsoff = ( 100 - stats.runsleg ) + '%';
		stats.runsleg += '%';
	}
	else
	{
		stats.runsleg = '';
		stats.runsoff = '';
	}
	
	// Write stats annotations
	var attrs = this.config.font;
	for ( var key in stats )
	{
		if ( key !== 'x' )
		{
			var cfg = this.config.key[ key ];
			
			var color = cfg.color;
			var color2 = cfg.lcolor || cfg.color;
						
			if ( this.config.keyDisplayMode === 'values' )
			{
			}
			else if ( this.config.keyDisplayMode === 'labelsandvalues' )
			{
				attrs['text-anchor'] = 'start';
				attrs['fill'] = color2;
				ctx.r.text( this.config.key.x[0], PULSE.Browser.y( cfg.y ), cfg.label ).attr( attrs );
				
				attrs['text-anchor'] = 'end';
				attrs['fill'] = color;
				ctx.r.text( this.config.key.x[1], PULSE.Browser.y( cfg.y ), stats[ key ] ).attr( attrs );
			}								
		}
	}
	
	// Now write any freetext
	if ( this.config.freetext )
	{
		var tf = new PULSE.RaphaelTextField( this.config.freetext );
		tf.addLine( this.config.freetext.text );
		tf.render( ctx.r, ctx.r.set() );
	}
};

PULSE.RaphaelWagonWheelRenderer.prototype.updateToSelection = function ()
{
	for ( var s = 0, slimit = this.sets.length; s < slimit; s++ )
	{
		var opacity = this.selected === s || this.selected === -1 ? 1 : 0;
		this.sets[s].animate( { opacity:opacity }, 500 );
	}
};

PULSE.RaphaelWagonWheelRenderer.pointDownLine = function ( start, end, amount, isFraction )
{
	var dx = end.x - start.x;
	var dy = end.y - start.y;
	
	if ( isFraction )
	{
		return { x: start.x + ( amount * dx ), 
			     y: start.y + ( amount * dy ) };
	}
	else
	{
		var theta = Math.atan2( dy, dx );
		if ( Math.sqrt( ( dx * dx ) + ( dy * dy ) ) <= amount ) 
		{
			return { x: end.x + ( 3 * Math.cos( theta ) ),
				     y: end.y + ( 3 * Math.sin( theta ) ) };
			// Ignore, as the current length is smaller than the target
			//return end;
		}
		else
		{
			return { x: start.x + ( amount * Math.cos( theta ) ),
					 y: start.y + ( amount * Math.sin( theta ) ) };
		}
	}
};

PULSE.RaphaelWagonWheelRenderer.prototype.onMouse = function ( event )
{
	// Get XY and then infer run class selection index
	var xy = Utils.getXY( event );
	var selection = -1;
	
	if ( xy !== undefined && xy.x >= this.config.keyLabelLeftLimit && xy.x <= this.config.keyLabelRightLimit
			&& xy.y >= this.config.keyLabelTopLimit && xy.y <= this.config.keyLabelBottomLimit )
	{
		selection = Math.floor( ( xy.y - this.config.keyLabelTopLimit ) / this.config.keyLabelWidth );
	}
	
	if ( selection !== this.selected )
	{
		this.selected = selection;
		this.updateToSelection();
	}
};

/*********************/
/* Beehive Placement */
/*********************/

PULSE.RaphaelBeehiveRenderer = function ( config ) 
{
	this.config = config;
}

PULSE.RaphaelBeehiveRenderer.prototype.render = function ( db, data, ctx )
{
	var that = this;
	ctx.r.clear();
	
	// Need to clone the array, so we can sort on type of ball
	var dataArray = Utils.cloneArray( data );
	
	// Sort the array
	dataArray.sort( function ( a, b ) 
	{
		var aw = a.get( CricketField.IS_WICKET );
		var bw = b.get( CricketField.IS_WICKET );
		
		if ( aw && !bw )
		{
			return 1;
		}
		else if ( !aw && bw )
		{
			return -1;
		}
		else
		{
			var ar = a.get( CricketField.CREDIT );
			var br = b.get( CricketField.CREDIT );
			return ar - br;
		}
		return 0;
	} );

	// Determine what variant of graph this is: left only, right only or mix
	var hasRight = false;
	var hasLeft = false;
	for ( var i = 0, j = dataArray.length; i < j; i++ )
	{
		var row = dataArray[i];
		var handedness = row.get( CricketField.HANDEDNESS );
		
		if ( CricketHandedness.RIGHT === handedness )
		{
			hasRight = true;
		}
		else if ( CricketHandedness.LEFT === handedness )
		{
			hasLeft = true;
		}
		
		if ( hasLeft && hasRight )
		{
			// Early exit, as we now know this is a mix graph
			break;
		}
	}
	
	// Set background based upon hasLeft/hasRight
	if ( hasLeft && hasRight )
	{
		this.controller.setBackground( this.config.variants.mix.background );
	}
	else if ( hasLeft )
	{
		this.controller.setBackground( this.config.variants.lh.background );
	}
	else if ( hasRight )
	{
		this.controller.setBackground( this.config.variants.rh.background );
	}
	
	// Parse ball size
	var sz = this.config.ballSize;
	var idx = this.config.ballSize.indexOf('px');
	if ( idx !== -1 )
	{
		sz = +( this.config.ballSize.substr( 0, idx ) );
	}
	sz /= 2;
	
	// Render all the balls
	for ( var i = 0, j = dataArray.length; i < j; i++ )
	{
		var row = dataArray[i];
		var xyz = row.get( CricketField.STUMPS );
		
		if ( xyz !== undefined )
		{
			xyz = db.normalise( xyz );
			
			if ( xyz.x > -999 && xyz.y > -999 && xyz.z > -999 )
			{
				// Flip data for lefties
				if ( ( CricketHandedness.LEFT === row.get( CricketField.HANDEDNESS ) ) && hasRight )
				{
					xyz.y = -xyz.y;
				}

				var runs = row.get( CricketField.CREDIT );
				var screenPos = this.config.projection.project( xyz );
	
				var colorKey;
				if ( row.get( CricketField.IS_WICKET ) )
				{
					colorKey = 'w';
				}
				else if ( runs == 0 )
				{
					colorKey = 'd';
				}
				else
				{
					var ww = row.get( CricketField.WW );
					if ( ww !== undefined )
					{
						var ly = ww.y;
						if ( ly > -999 )
						{
							var leg = ly > 0;
							if ( CricketHandedness.LEFT === row.get( CricketField.HANDEDNESS ) )
							{
								leg = !leg;
							}
							
							if ( runs >= 4 )
							{
								colorKey = leg ? 'lb' : 'ob';
							}
							else 
							{
								colorKey = leg ? 'l' : 'o';
							}
						}
					}
				}
				
				var img = 'images/balls/' + this.config.ballSize + '/phe_' + this.config.colors[ colorKey ] + '_ball.png';
				ctx.r.image( img, screenPos.x - sz, screenPos.y - sz, sz * 2, sz * 2 );
			}
		}
	}
};

/***************/
/* Bowl Speeds */
/***************/

PULSE.RaphaelBowlSpeedsRenderer = function ( config ) 
{
	this.config = config;
	this.selected = -1;
	this.stickies = [];
};

PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD = 500; 

PULSE.RaphaelBowlSpeedsRenderer.prototype.render = function ( db, data, ctx )
{
	this.db = db;
	this.data = data;
	this.ctx = ctx;
	this.selected = -1;
	this.stickies = [];
	
	// Prepare the data
	// Place balls into bowler buckets
	this.bowlerData = {};
	this.wicketData = {};
	this.maxPoints = 20;
	
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		var row = this.data[i];
		var bowler = this.db.lookupPlayer( row.get( CricketField.BOWLER ) );
		var speed = row.get( CricketField.BOWL_SPEED );
		
		if ( !Utils.isNullish( bowler ) && speed >= 40 )
		{
			// Convert speed to units currently in use
	        if ( PULSE.SpeedModeController.mode === PULSE.SpeedModeController.MODE_KMH )
	        {
	        	speed = PULSE.SpeedModeController.mphToKmh( speed );
	        }
			
			// Handle speed data for this bowler
			var bd = this.bowlerData[ bowler ];
			if ( bd === undefined )
			{
				bd = [];
				this.bowlerData[ bowler ] = bd;
			}
			bd.push( speed );
			
			// Ensure we keep track of the lengthiest series
			if ( bd.length > this.maxPoints )
			{
				this.maxPoints = bd.length;
			}
			
			// Handle a wicket fall
			if ( row.get( CricketField.IS_WICKET ) )
			{
				var wf = this.wicketData[ bowler ];
				if ( wf === undefined )
				{
					wf = [];
					this.wicketData[ bowler ] = wf;
				}
				wf.push( { x:bd.length, y:speed } );
			}
		}
	}

	// Get the maximum bowler name width, so we can adjust the key/graph width
	this.maxWidth = 90;
	for ( var bowler in this.bowlerData )
	{
		var temp = this.ctx.r.text( 0, 0, bowler ).attr( this.config.font );
		var size = temp.getBBox();
		if ( size.width > this.maxWidth )
		{
			this.maxWidth = size.width;
		}
		temp.remove();
	}

	this.draw();
};
	
PULSE.RaphaelBowlSpeedsRenderer.prototype.draw = function () 
{
	this.ctx.r.clear();
	this.bowlerObjects = [];
	
	// Draw key shading box
	var keyMarginR = this.config.keyMarginR ? this.config.keyMarginR : this.config.keyMargin;
	var boxWidth = this.maxWidth + this.config.keyMargin + keyMarginR;
	
	this.ctx.r.rect( this.config.width - boxWidth, 0, boxWidth, this.config.height )
	          .attr( { fill:this.config.keyFill.color, opacity:this.config.keyFill.opacity, 
	        	       stroke:'none' } );
	
	// And size the x-axis
	this.config.xAxis.end = this.config.width - boxWidth - ( 2 * this.config.keyMargin );
	
	// Dynamically set the xAxis range
	this.config.xAxis.max = this.maxPoints;
	
	// Draw the axes
	this.config.xAxis.font = this.config.font;
	this.config.yAxis.font = this.config.font;
	this.config.xAxis.drawTo( this.ctx.r, true );
	this.config.yAxis.drawTo( this.ctx.r, false );
	
	// Now create objects for each bowler's stats
	var y = 20;
	var i = 0;
	var selectedBowler;
	for ( var bowler in this.bowlerData )
	{
		var bowlerObjects = {};
		
		var speeds = this.bowlerData[ bowler ];
		var falls = this.wicketData[ bowler ];
		var stats = Utils.getStats( speeds );
		
		// Create name label
		bowlerObjects.name = this.ctx.r.text( this.config.width - keyMarginR, PULSE.Browser.y( y ), bowler )
		                               .attr( this.config.font )
		                               .attr( { 'text-anchor':'end', stroke:'none' } );

		y += 15;
		
		// Create speeds label
		bowlerObjects.speeds = this.ctx.r.text( this.config.width - keyMarginR, PULSE.Browser.y( y ),
												stats.mean.toFixed( 1 ) + ' / ' + stats.maximum.toFixed( 1 ) )
										 .attr( this.config.font )
										 .attr( { 'text-anchor':'end', stroke:'none' } );
		
		y += 27;

		// Create stickies background
		bowlerObjects.bg = this.ctx.r.rect( this.config.width - boxWidth + ( this.config.keyMargin / 2 ), 
										    y - 52,	boxWidth - keyMarginR, 37 )
								     .attr( { fill:'#fff', stroke:'none', opacity:0 } );

		// Create the line and wicket set, adding them to the container
		this.renderSeries( bowlerObjects, 
				this.config.boxWhisker, this.ctx.r, bowler, speeds, falls, this.config.colors[i], i );

		// Add Raphael object container to list of containers
		this.bowlerObjects.push( bowlerObjects );
		
		// Maximum of 8 bowlers
		if ( ++i > 7 )
		{
			break;
		}
	}
	
	this.bowlerCount = i;

	// Finally drive an initial updateToSelection to set colors and thicknesses
	this.updateToSelection();
};

PULSE.RaphaelBowlSpeedsRenderer.prototype.updateToSelection = function ()
{
	for ( var bowler = 0; bowler < this.bowlerCount; bowler++ )
	{
		var color = this.getColor( this.config.colors[bowler], bowler, this.selected, this.stickies );
		var bo = this.bowlerObjects[ bowler ];
		var sticky = Utils.isInArray( this.stickies, bowler );

		// Calculate sizes, colours and focus
		var width = 2;
		var marker = 3;
		var wicketStroke = '#000';
		var front = false;
		
		if ( this.selected !== -1 )
		{
			if ( this.selected === bowler || sticky )
			{
				width = 3;
				marker = 4;
				front = true;
			}
			else
			{
				width = 1;
				wicketStroke = '#444';
			}
		}
		
		// Update line rendering
		bo.line.animate( { stroke:color, 'stroke-width':width, opacity:1 }, 
						 PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD );

		// Update wicket rendering
		if ( bo.wickets.length > 0 )
		{
			bo.wickets.animate( { stroke:wicketStroke, fill:color, r:marker }, 
								PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD );
		}

		// Bring to front if we need to
		if ( front )
		{
			bo.line.toFront();
			bo.wickets.toFront();
		}
		
		// Update label rendering
		var color2 = this.getColor( '#fff', bowler, this.selected, this.stickies, '#bbb' );
		bo.name.animate( { fill:color }, PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD );
		bo.speeds.animate( { fill:color2 }, PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD );

		// Update sticky rendering
		bo.bg.animate( { opacity: sticky ? 0.1 : 0 }, PULSE.RaphaelBowlSpeedsRenderer.ANIM_PERIOD );
	}
};

PULSE.RaphaelBowlSpeedsRenderer.prototype.onMouse = function ( event )
{
	// Get XY and then infer bowler selection index
	var xy = Utils.getXY( event );
	var selection = -1;
	
	if ( xy !== undefined && xy.x > 490 && 
			( !this.config.keyMarginR || xy.x < this.config.width - this.config.keyMarginR ) ) 
	{
		selection = Math.round( ( xy.y - 27 ) / 42 );
		if ( selection >= this.bowlerCount )
		{
			selection = -1;
		}
	}
	
	var update = false;
	if ( 'mousemove' === event.type )
	{
		if ( this.selected !== selection )
		{
			this.selected = selection;
			update = true;
		}
	}
	else if ( 'mousedown' === event.type )
	{
		this.stickies = Utils.toggleExistence( this.stickies, selection );
		update = true;
	}

	if ( update )
	{
		this.updateToSelection();
	}
};
	
PULSE.RaphaelBowlSpeedsRenderer.prototype.getColor = function ( color, index, selection, others, alt )
{
	if ( selection === -1 || selection === index || Utils.isInArray( others, index ) )
	{
		return color;
	}
	else if ( alt !== undefined )
	{
		return alt;
	}
	else
	{
		return '#888';
	}
};

PULSE.RaphaelBowlSpeedsRenderer.prototype.renderSeries = 
	function ( container, boxWhisker, r, bowler, speeds, falls, color, index )
{
	if ( boxWhisker )
	{
		this.renderSeriesBW( container, r, bowler, speeds, falls, color, index );
	}
	else
	{
		this.renderSeriesLine( container, r, bowler, speeds, falls, color, index );
	}
};

PULSE.RaphaelBowlSpeedsRenderer.prototype.renderSeriesLine = 
	function ( container, r, bowler, speeds, falls, color, index )
{
	var path = 'M';
	for ( var i = 0, j = speeds.length; i < j; i++ )
	{
		if ( i > 0 )
		{
			path += 'L';
		}
		
		var x = this.config.xAxis.project( i + 1 );
		var y = this.config.yAxis.project( speeds[i] );

		path += x + ' ' + y;
	}
	container.line = r.path( path ).attr( { fill:'none', opacity:0 } );
	container.wickets = r.set();
	
	if ( falls !== undefined )
	{
		for ( var i = 0, j = falls.length; i < j; i++ )
		{
			var point = falls[i];
			var x = this.config.xAxis.project( point.x );
			var y = this.config.yAxis.project( point.y );

			container.wickets.push( r.circle( x, y, 0 ) );
		}
	}
};

// This method is not yet ported to pure Raphael as I don't want to spend time on stuff that
// isn't currently live
PULSE.RaphaelBowlSpeedsRenderer.prototype.renderSeriesBW = function ( ctx, bowler, speeds, falls, color, index )
{
	var fns = Utils.getFiveNumberSummary( speeds );
	var hw = 10;
	
	var values = [ fns.min, fns.lq, fns.median, fns.uq, fns.max ];
	var projected = [];
	for ( var i = 0, ilimit = values.length; i < ilimit; i++ )
	{
		projected.push( this.config.yAxis.project( values[i] ) );
	}
	
	var x = this.config.xAxis.project( ( index + 1 ) * 10 );

	ctx.beginPath();
	ctx.moveTo( x - hw, projected[0] );
	ctx.lineTo( x + hw, projected[0] );
	ctx.moveTo( x - hw, projected[4] );
	ctx.lineTo( x + hw, projected[4] );
	ctx.moveTo( x, projected[0] );
	ctx.lineTo( x, projected[4] );
	ctx.stroke();
	
	ctx.rect( x - hw, projected[3], hw * 2, projected[1] - projected[3] );
	ctx.fillStyle = 'blue';
	ctx.fill();

	ctx.moveTo( x - hw, projected[2] );
	ctx.lineTo( x + hw, projected[2] );
	ctx.stroke();
};

/****************/
/* Partnerships */
/****************/

PULSE.RaphaelPartnershipsRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelPartnershipsRenderer.prototype.render = function ( db, data, ctx )
{
	ctx.r.clear();
	
	var stats = { b1name:null, b2name:null, b1runs:0, b2runs:0, pruns:0 };
	var first = true;
	var y = 0;
	
	for ( var i = 0, j = data.length; i < j; i++ )
	{
		var row = data[i];
		
		var facing = db.lookupPlayer( row.get( CricketField.BATSMAN ) );
		var nonfacing = db.lookupPlayer( row.get( CricketField.NF_BATSMAN ) );
		
		if ( Utils.isNullish( facing ) || Utils.isNullish( nonfacing ) )
		{
			continue;
		}
		
        if ( ( facing !== stats.b1name && facing !== stats.b2name ) ||
        	 ( nonfacing !== stats.b1name && nonfacing !== stats.b2name ) )
        {
         	if ( first )
         	{
         		first = false;
         	}
         	else
         	{
         		this.renderPartnership( ctx.r, stats, y++ );
         	}
         	
        	if ( nonfacing === stats.b1name )
        	{
        	    stats.b1name = nonfacing;
        	    stats.b2name = facing;
        	}
        	else
        	{
        		stats.b1name = facing;
        		stats.b2name = nonfacing;
        	}
        	
        	stats.b1runs = 0;
        	stats.b2runs = 0;
        	stats.pruns = 0;
        }
        
        var credit = +row.get( CricketField.CREDIT );
        if ( stats.b1name === facing )
        {
            stats.b1runs += credit;
        }
        else
        {
        	stats.b2runs += credit;
        }
        
        stats.pruns += ( +row.get( CricketField.RUNS ) );
    }

	this.renderPartnership( ctx.r, stats, y++ );
};

PULSE.RaphaelPartnershipsRenderer.prototype.renderPartnership = function ( r, stats, pship )
{
	if ( pship < 10 )
	{
		var y = this.config.ystart + ( pship * this.config.yspacing );
		var x = this.config.width / 2;
		
		// Draw bars
		var gradient = '270-' + this.config.bars.colorStops[0] + '-' + this.config.bars.colorStops[1]; 
		var gradientSet = r.set();
		
		var yshift = 0;
		if ( this.config.bars.yshift )
		{
			yshift = this.config.bars.yshift;
		}
		
		var bl;
		if ( stats.b1runs > 0 )
		{
			bl = this.barLength( stats.b1runs );
			
			gradientSet.push( r.circle( x-this.config.tabs[1]-bl, y + yshift, this.config.bars.width / 2 ) );
			gradientSet.push( r.rect( x-this.config.tabs[1] - bl, y + yshift - (this.config.bars.width/2), 
							  bl, this.config.bars.width ) );
		}
		
		if ( stats.b2runs > 0 )
		{
			bl = this.barLength( stats.b2runs );
			
			gradientSet.push( r.circle( x+this.config.tabs[1]+bl, y + yshift, this.config.bars.width / 2 ) );
			gradientSet.push( r.rect( x+this.config.tabs[1], y + yshift - (this.config.bars.width/2), 
							  bl, this.config.bars.width ) );
		}
		
		gradientSet.attr( { fill:gradient, stroke:'none' } );
		
		// Draw text labels
		attr = this.config.otherText.font;
		attr.fill = this.config.otherText.style;
		attr.stroke = 'none';
		attr['text-anchor'] = 'start';

		r.text( x+this.config.tabs[0], PULSE.Browser.y( y ), stats.b2runs ).attr( attr );
		r.text( x+this.config.tabs[2], PULSE.Browser.y( y ), stats.b2name ).attr( attr );
		
		attr['text-anchor'] = 'end'

		r.text( x-this.config.tabs[0], PULSE.Browser.y( y ), stats.b1runs ).attr( attr );
		r.text( x-this.config.tabs[2], PULSE.Browser.y( y ), stats.b1name ).attr( attr );

		attr = this.config.pshipText.font;
		attr.fill = this.config.pshipText.style;
		attr['text-anchor'] = 'middle'
		r.text( x, PULSE.Browser.y( y ), stats.pruns ).attr( attr );
	}
};

PULSE.RaphaelPartnershipsRenderer.prototype.barLength = function ( runs )
{
	return Math.min( runs + this.config.bars.minLength, this.config.bars.maxLength );
};

/*****************/
/* Runs Per Over */
/*****************/

PULSE.RaphaelRunsPerOverRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelRunsPerOverRenderer.prototype.render = function ( db, data, ctx )
{
	this.db = db;
	this.variant = obtainVariant( this.config, this.db );
	this.data = this.prepareData( data );
	this.r = ctx.r;
	
	this.tooltipData = undefined;
	this.draw();
};

PULSE.RaphaelRunsPerOverRenderer.prototype.prepareData = function ( data )
{
	this.tooltipDataCache = {};

	var overStats = [];
	
	var lastOver = 0;
	var stats = { r:0, w:0, dismissed:[] };
	for ( var i = 0, j = data.length; i < j; i++ )
	{
		var row = data[i];
		
		var over = +row.get( CricketField.OVER );
		if ( over !== lastOver )
		{
			// New over
			// If this isn't the first over, render the previous one
			if ( over !== 1 )
			{
				overStats.push( this.prepareRecord( lastOver, stats ) );
			}

			lastOver = over;
			
			// Reset stats
			stats.r = 0;
			stats.w = 0;
			stats.dismissed = [];
		}
		
		stats.r += ( +row.get( CricketField.RUNS ) );
		if ( row.get( CricketField.IS_WICKET ) )
		{
			stats.w++;
			stats.dismissed.push( row.get( CricketField.DISMISSED ) );
		}
	}
	
	overStats.push( this.prepareRecord( lastOver, stats ) );
	return overStats;
};

PULSE.RaphaelRunsPerOverRenderer.prototype.prepareRecord = function ( over, stats )
{
	var x = this.variant.xAxis.project( over );
	var y = this.variant.yAxis.project( stats.r );
	
	// Add to tooltip cache
	var ix = Math.round( x );
	var iy = Math.round( y );
	this.tooltipDataCache[ ix ] = { x:ix, y:iy, dismissed:stats.dismissed };
	
	return { x:x, y:y, w:stats.w };
};

PULSE.RaphaelRunsPerOverRenderer.prototype.draw = function ()
{
	this.r.clear();
	
	// Draw axes
	this.variant.xAxis.font = this.config.font;
	this.variant.yAxis.font = this.config.font;
	this.variant.xAxis.drawTo( this.r, true );
	this.variant.yAxis.drawTo( this.r, false );
	
	// Iterate over bars
	var y0 = this.variant.yAxis.project( 0 ) - 1;
	var ymax = this.variant.yAxis.project( this.variant.yAxis.max );
	
	for ( var i = 0, ilimit = this.data.length; i < ilimit; i++ )
	{
		var record = this.data[i];
		
		// Calculate fraction of total y axis height
		var fraction = ( record.y - y0 ) / ( ymax - y0 );
		if ( fraction > 1 )
		{
			fraction = 1;
		}
		
		var color = Utils.intermediateColor( this.variant.bars.colorStops[0],
											 this.variant.bars.colorStops[1], fraction );
		var fill = '90-' + this.variant.bars.colorStops[0] + '-' + color;

		if ( y0 - record.y > 0 )
		{
			this.r.rect( record.x - ( this.variant.bars.width / 2 ), record.y, 
					     this.variant.bars.width, y0 - record.y )
				  .attr( { fill:fill, stroke:'none' } );
		}

		for ( var j = 0, jlimit = record.w; j < jlimit; j++ )
		{
			this.r.circle( record.x, record.y - ( j * this.variant.bars.fowsize ), this.variant.bars.fowsize / 2 )
			      .attr( { stroke:this.config.fow.stroke, fill:this.config.fow.fill, 'stroke-width':1 } );
		}
	}
};

PULSE.RaphaelRunsPerOverRenderer.prototype.updateTooltip = function ()
{
	if ( this.tooltipData )
	{
		// Remove any current tooltip set
		if ( this.ttSet )
		{
			try
			{
				this.ttSet.remove();
			}
			catch ( exception )
			{
				// Potentially tries to remove an object already cleared
			}
		}
		
		var cfg = this.config.tooltip;
		var anchorv = 'n';
		var anchorh = 'w';
		
		if ( this.tooltipData.x > this.config.width / 2 )
		{
			anchorh = 'e';
		}
		if ( this.tooltipData.y > this.config.height / 2 )
		{
			anchorv = 's';
		}
		
		cfg.position = { x:this.tooltipData.x, y:this.tooltipData.y, anchor:anchorv + anchorh };

		// Create a new set and build Raphael object stack for a text field in it
		this.ttSet = this.r.set();
		var tf = new PULSE.RaphaelTextField( cfg );
		tf.setLines( this.tooltipData.dismissed );
		tf.render( this.r, this.ttSet );
	}
	else
	{
		this.ttSet.animate( { opacity:0 }, 1000 );
	}
};

PULSE.RaphaelRunsPerOverRenderer.prototype.onMouse = function ( event )
{
	// Get XY and then infer over bar
	var xy = Utils.getXY( event );
	var tt = this.findNearbyTooltip( xy );
	
	if ( tt !== this.tooltipData )
	{
		this.tooltipData = tt;
		this.updateTooltip();
	}
};

PULSE.RaphaelRunsPerOverRenderer.prototype.findNearbyTooltip = function ( xy )
{
	if ( xy )
	{
		for ( var x = xy.x - ( this.variant.bars.width / 2 ); 
		          x <= xy.x + ( this.variant.bars.width / 2 ); x++ )
		{
			var tt = this.tooltipDataCache[ x ]; 
			if ( tt && tt.dismissed.length > 0 )
			{
				return tt;
			}
		}
	}
};

/************/
/* Run Rate */
/************/

PULSE.RaphaelRunRateRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelRunRateRenderer.prototype.render = function ( db, data, ctx )
{
	this.db = db;
	this.variant = obtainVariant( this.config, this.db );
	this.data = this.prepareData( data );
	this.ctx = ctx;
	
	ctx.r.clear();
	this.tooltipData = undefined;
	this.tooltipLines = [ ctx.r.path(), ctx.r.path(), ctx.r.path(), ctx.r.path() ];
	
	this.draw();
};

PULSE.RaphaelRunRateRenderer.prototype.prepareData = function ( data )
{
	this.tooltipDataCache = {};

	var inningsSeries = {};

	if ( data.length > 0 )
	{
		// Place data into innings buckets (for performance reasons, we should look at combining
		// this bucketisation with the actual data series creation below)
		var inningsData = {};
		for ( var i = 0, ilimit = data.length; i < ilimit; i++ )
		{
			var row = data[i];
			var innings = +row.get( CricketField.INNINGS );
			
			// Obtain or create bucket
			var inningsDataItem = inningsData[ innings ];
			if ( inningsDataItem === undefined )
			{
				inningsDataItem = [];
				inningsData[ innings ] = inningsDataItem;
			}
			
			// Add item to bucket
			inningsDataItem.push( row );
		}
	
		// Keep track of maximum number of overs (for Test cricket)
		var maxOvers = 0;

		// Get the participants
		var participants = this.db.getParticipants();
		
		// Now iterate over all all balls in each innings bucket
		for ( var innings = 1; innings <= 4; innings++ )
		{
			// Get the participant name
			var pIndex = this.db.getBattingTeamIndex( innings );
			var pName = participants[ pIndex ].abbreviation;
			
			inningsSeries[ innings ] = [];
			
			var inningsRecords = inningsData[ innings ];
			if ( inningsRecords === undefined || inningsRecords.length === 0 )
			{
				// Break out
				break;
			}
			
			var stats = { runs:0, wickets:0, over:0 };
			var lastOver = 0;
			
			for ( var i = 0, j = inningsRecords.length; i < j; i++ )
			{
				var row = inningsRecords[ i ];
				var over = +row.get( CricketField.OVER );
				
				if ( over !== lastOver )
				{
					// New over
					// If this isn't the first over, add the previous one
					if ( over !== 1 )
					{
						inningsSeries[ innings ].push( this.prepareRecord( stats, pName ) );
					}
	
					lastOver = over;
					
					// Reset stats
					stats.wickets = 0;
					stats.over = over;
				}
				
				stats.runs += ( +row.get( CricketField.RUNS ) );
				if ( row.get( CricketField.IS_WICKET ) )
				{
					stats.wickets++;
				}
				
				// Update max overs
				if ( over > maxOvers )
				{
					maxOvers = over;
				}
			}
			
			// Add final stats
			inningsSeries[ innings ].push( this.prepareRecord( stats, pName ) );
		}
	
		// Scale the xAxis if need be
		this.variant.xAxis.max = this.variant.xAxis.configuredMax; 
		if ( maxOvers > this.variant.xAxis.max )
		{
			this.variant.xAxis.max = maxOvers;
		}
	}
	
	return inningsSeries;
};

PULSE.RaphaelRunRateRenderer.prototype.prepareRecord = function ( stats, participant )
{
	var yvalue = this.getYValue( stats );
	var x = this.variant.xAxis.project( stats.over );
	var y = this.variant.yAxis.project( yvalue );
	
	// Add to tooltip cache
	var ix = Math.round( x );
	var iy = Math.round( y );
	var xcache = this.tooltipDataCache[ ix ];
	if ( !xcache )
	{
		xcache = { x:ix, xvalue:stats.over };
		this.tooltipDataCache[ ix ] = xcache;
	}
	xcache[ iy ] = { y:iy, yvalue:yvalue, participant:participant };
	
	return { x:x, y:y, w:stats.wickets };
};

PULSE.RaphaelRunRateRenderer.prototype.draw = function ()
{
	this.variant.xAxis.font = this.config.font;
	this.variant.yAxis.font = this.config.font;
	
	this.variant.xAxis.drawTo( this.ctx.r, true );
	this.variant.yAxis.drawTo( this.ctx.r, false );

	// Now render each series
	var flexikey = new PULSE.RaphaelFlexikey( this.config.flexikey );
	var participants = this.db.getParticipants();

	var gt = this.db.getMatchType();
	var suffix = '';
	
	for ( var i = 1; i <= 4; i++ )
	{
		var thisInningsSeries = this.data[ i ];
		
		if ( thisInningsSeries === undefined || thisInningsSeries.length < 1 )
		{
			// Early exit
			break;
		}
		
		var pIndex = this.db.getBattingTeamIndex( i );
		var color;
		if ( i <= 2 )
		{
			color = participants[ pIndex ].primaryColor;
			suffix = ' 1st inns'; 
		}
		else
		{
			color = participants[ pIndex ].secondaryColor;
			suffix = ' 2nd inns';
		}
		
		this.renderSeries( this.ctx.r, thisInningsSeries, color );
		
		var label = participants[ pIndex ].fullName;
		if ( CricketMatchType.TEST === gt )
		{
			label += suffix;
		}
		
		flexikey.addEntry( label, color );
	}
	
	// Finally render the Flexikey
	flexikey.render( this.ctx.r );
};

PULSE.RaphaelRunRateRenderer.prototype.renderSeries = function ( r, series, color )
{
	// Create the line
	var path = '';
	for ( var i = 0, ilimit = series.length; i < ilimit; i++ )
	{
		var item = series[i];
		if ( i === 0 )
		{
			path += 'M';
		}
		else
		{
			path += 'L';
		}
		path += item.x + ' ' + item.y;
	}
	r.path( path ).attr( { 'stroke-width':3, stroke:color, fill:'none' } );
	
	// Create the wicket falls
	for ( var i = 0, ilimit = series.length; i < ilimit; i++ )
	{
		var item = series[i];
		if ( item.w > 0 )
		{
			for ( var k = 0, l = item.w; k < l; k++ )
			{
				r.circle( item.x, item.y - ( k * this.config.fow.size ), this.config.fow.size / 2 )
				 .attr( { 'stroke-width':1, stroke:this.config.fow.stroke, fill:color } );
			}
		}
	}
};

PULSE.RaphaelRunRateRenderer.prototype.onMouse = function ( event )
{
	// Get XY and then infer over bar
	var xy = Utils.getXY( event );
	var tooltipData = this.findNearbyTooltip( xy );
	
	if ( this.tooltipData !== tooltipData )
	{
		this.tooltipData = tooltipData;
		this.updateTooltip();
	}
};

PULSE.RaphaelRunRateRenderer.prototype.updateTooltip = function ()
{
	// Remove any current tooltip set
	if ( this.ttSet )
	{
		try
		{
			this.ttSet.remove();
		}
		catch ( exception )
		{
			// Potentially tries to remove an object already cleared
		}
	}

	var idx = 0;
	if ( this.tooltipData )
	{
		if ( this.config.textField )
		{
			this.ttSet = this.ctx.r.set();
			this.tf = new PULSE.RaphaelTextField( this.config.textField );
			this.tf.addLine( '<c:#bbb>Over </c>' + this.tooltipData.xvalue );
		}
		
		var line = '';
		for ( var ttditem in this.tooltipData )
		{
			if ( ttditem !== 'x' && ttditem !== 'xvalue' )
			{
				var t = this.tooltipData[ttditem];
			
				var path = 'M' + this.variant.xAxis.start + ' ' + t.y +
				           'L' + this.tooltipData.x + ' ' + t.y +
				           'L' + this.tooltipData.x + ' ' + this.variant.yAxis.start;
				
				this.tooltipLines[idx].attr( { stroke:'#fff', opacity:0.6, path:path,
					                           'stroke-width':2 } );

				line += '<c:#bbb>' + t.participant + ' </c>' + this.format( t.yvalue ) + ', ';
				idx++;
			}
		}
		
		if ( this.tf )
		{
			if ( line.length > 2 )
			{
				line = line.substr( 0, line.length - 2 );
			}
			this.tf.addLine( line );
			this.tf.render( this.ctx.r, this.ttSet );
		}
	}
	
	// Clear out unused lines
	for ( var idx2 = idx; idx2 < this.tooltipLines.length; idx2++ )
	{
		this.tooltipLines[idx2].attr( { path:'M0 0 L0 0' } );
	}
};

PULSE.RaphaelRunRateRenderer.prototype.findNearbyTooltip = function ( xy )
{
	if ( xy )
	{
		if ( xy.x <= this.variant.xAxis.end && xy.x >= this.variant.xAxis.start &&
		     xy.y >= this.variant.yAxis.end && xy.y <= this.variant.yAxis.start )
		{
			var search = xy.x;
			
			while ( search >= this.variant.xAxis.start )
			{
				if ( this.tooltipDataCache[ search ] )
				{
					return this.tooltipDataCache[ search ];
				}
				else
				{
					// If there was no data for this x value, try using one to the left
					search--;
				}				
			}
		}
	}
};

PULSE.RaphaelRunRateRenderer.prototype.getYValue = function ( item )
{
	return item.runs / item.over;
};

PULSE.RaphaelRunRateRenderer.prototype.format = function ( value )
{
	return value.toFixed( 2 ) + ' <c:#bbb>rpo</c>';
};

/*********/
/* Worms */
/*********/

PULSE.RaphaelWormsRenderer = function ( config ) 
{
	this.config = config;
};

PULSE.RaphaelWormsRenderer.prototype.render = PULSE.RaphaelRunRateRenderer.prototype.render;
PULSE.RaphaelWormsRenderer.prototype.prepareData = PULSE.RaphaelRunRateRenderer.prototype.prepareData;
PULSE.RaphaelWormsRenderer.prototype.draw = PULSE.RaphaelRunRateRenderer.prototype.draw;
PULSE.RaphaelWormsRenderer.prototype.renderSeries = PULSE.RaphaelRunRateRenderer.prototype.renderSeries;
PULSE.RaphaelWormsRenderer.prototype.prepareRecord = PULSE.RaphaelRunRateRenderer.prototype.prepareRecord;
PULSE.RaphaelWormsRenderer.prototype.onMouse = PULSE.RaphaelRunRateRenderer.prototype.onMouse;
PULSE.RaphaelWormsRenderer.prototype.findNearbyTooltip = PULSE.RaphaelRunRateRenderer.prototype.findNearbyTooltip;
PULSE.RaphaelWormsRenderer.prototype.updateTooltip = PULSE.RaphaelRunRateRenderer.prototype.updateTooltip;

PULSE.RaphaelWormsRenderer.prototype.format = function ( value )
{
	return value + ' <c:#bbb>runs</c>';
};

PULSE.RaphaelWormsRenderer.prototype.getYValue = function ( item )
{
	return item.runs;
};

/******************/
/* Win Likelihood */
/******************/

PULSE.RaphaelWinLikelihoodRenderer = function ( config ) 
{
	this.config = config;
	this.font = Utils.cloneObject( config.font );
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.render = function ( db, data, ctx )
{
	this.db = db;
	this.data = data;
	this.ctx = ctx;

	this.ctx.r.clear();
	
	this.tooltipData = undefined;
	this.dismissalData = undefined;
	this.tooltipDataCache = {};
	this.draw();
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.draw = function ()
{
	var currentInnings = 0;
	var currentOver = 0;
	var dismissals = [];
	var x = 1;
	var battingIndex = 0;
	var series = [ [], [], [] ];
	
	var likelihoods;
	var lastLikelihoods;
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		var row = this.data[ i ];

		likelihoods = row.get( CricketField.WIN_LIKELIHOODS );
		if ( likelihoods === undefined )
		{
			// No likelihoods for this record, so simply copy the last one
			likelihoods = lastLikelihoods;
		}

		if ( likelihoods === undefined )
		{
			// No likelihoods yet, so break
			continue;
		}

		var over = row.get( CricketField.OVER ); 
		if ( over !== currentOver )
		{
			if ( currentOver != 0 )	// Allow coercion
			{
				this.addData( series, x, likelihoods, battingIndex, dismissals );
			}
			
			dismissals = [];
			currentOver = over;
			x++;
		}
		
		var innings = row.get( CricketField.INNINGS );
		if ( innings !== currentInnings )
		{
			currentInnings = innings;
			battingIndex = this.db.getBattingTeamIndex( innings );
		}
		
		if ( row.get( CricketField.IS_WICKET ) )
		{
			dismissals.push( row.get( CricketField.DISMISSED ) );
		}
		
		lastLikelihoods = likelihoods;
	}
	
	if ( likelihoods !== undefined )
	{
		this.addData( series, x, likelihoods, battingIndex, dismissals );
	}
	
	// Scale the x-axis if necessary
	this.config.xAxis.max = this.config.xAxis.configuredMax;
	if ( x > this.config.xAxis.max )
	{
		this.config.xAxis.max = x;
	}

	// Also scale back the y-axis if there will be 3 items in the key
	this.config.yAxis.end = this.config.yAxis.configuredEnd;
	var testMatch = ( CricketMatchType.TEST === this.db.getMatchType() );
	if ( testMatch )
	{
		// Shift y-axis down to allow for larger key
		this.config.yAxis.end += 30;
	}
	
	// Draw the axes
	this.config.xAxis.font = this.font;
	this.config.yAxis.font = this.font;
	this.config.xAxis.drawTo( this.ctx.r, true );
	this.config.yAxis.drawTo( this.ctx.r, false );

	// Create flexikey
	var flexikey = new PULSE.RaphaelFlexikey( this.config.flexikey );

	// Render the draw series first, if we need to
	if ( testMatch )
	{
		this.renderSeries( this.ctx.r, series[1], this.config.drawColor, 'Draw' );
	}
	
	// Now draw the team series
	var participants = this.db.getParticipants();
	for ( var team = 0; team < 2; team++ )
	{
		var color = participants[ team ].primaryColor;
		this.renderSeries( this.ctx.r, series[ 2 * team ], color, participants[ team ].fullName );
		flexikey.addEntry( participants[ team ].fullName, color );

		// Add the draw item to the key now
		if ( team === 0 && testMatch )
		{
			flexikey.addEntry( 'Draw', this.config.drawColor );
		}
	}
	
	// Render the Flexikey
	flexikey.render( this.ctx.r );
	
	// Finally create tooltip objects
	var bgAttr = { fill:this.config.tooltips.background.color, stroke:'none', opacity:0 };
	
	var textAttr = this.config.font;
	textAttr.fill = this.config.tooltips.foreground;
	textAttr.stroke = 'none';
	textAttr.opacity = 0;
	
	this.tooltipObjects = { line          : this.ctx.r.path()
			                                          .attr( { stroke:this.config.tooltips.background.color,
			                                        	       'stroke-width':2,
			                                        	       fill:'none',
			                                        	       opacity:0 } ),
			                bgs          : [ this.ctx.r.rect().attr( bgAttr ), 
			                                 this.ctx.r.rect().attr( bgAttr ), 
			                                 this.ctx.r.rect().attr( bgAttr ) ],
			                texts        : [ this.ctx.r.text().attr( textAttr ), 
			                                 this.ctx.r.text().attr( textAttr ), 
			                                 this.ctx.r.text().attr( textAttr ) ] };
    this.dismissal = this.ctx.r.set();
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.updateTooltip = function ()
{
	// Finally render the tooltip data
	if ( this.tooltipData )
	{
		var path = 'M' + this.tooltipData.x + ' ' + ( this.config.yAxis.start - 1 ) +
		           'L' + this.tooltipData.x + ' ' + this.config.yAxis.end;
		this.tooltipObjects.line.attr( { 
				path:path, 
				opacity:this.config.tooltips.background.opacity } );

		var idx = 0;
		for ( var labelName in this.tooltipData.labels )
		{
			var label = this.tooltipData.labels[ labelName ];
			
			// If this label overlaps with another one that has a higher value, then simply
			// skip the rendering of this label
			// 1. Find all other labels within spitting distance of this one
			var others = [];
			for ( var labelCheck in this.tooltipData.labels )
			{
				if ( labelCheck === labelName )
				{
					continue;
				}
				var other = this.tooltipData.labels[ labelCheck ];
				if ( Math.abs( other.y - label.y ) <= this.config.tooltips.height )
				{
					others.push( other );
				}
			}
			// 2. Find out if there is one bigger (i.e. lower y value)
			var skip = false;
			for ( var i = 0, j = others.length; i < j && !skip; i++ )
			{
				if ( others[i].y < label.y )
				{
					skip = true;
				}
				else if ( others[i].y === label.y )
				{
					// They are the same, so choose the one alphabetically first
					skip = others[i].string < label.string;
				}
			}

			if ( !skip )
			{
				// Render this team label
				var temp = this.ctx.r.text( -1000, -1000, label.string ).attr( this.config.font );
				var size = temp.getBBox();
				temp.remove();
				
				var width = size.width + this.config.tooltips.border.left + this.config.tooltips.border.right;
				var anchor = 'start';
				var offset = 0;
				var textOff = this.config.tooltips.border.left;
	
				if ( this.tooltipData.x + width > this.config.xAxis.end )
				{
					offset = -width;
					anchor = 'end';
					textOff = -this.config.tooltips.border.right;
				}
				
				this.tooltipObjects.bgs[idx].attr( { x:this.tooltipData.x + offset,
													 y:label.y - this.config.tooltips.height / 2,
													 width:width,
													 height:this.config.tooltips.height,
													 opacity:this.config.tooltips.background.opacity } );
			
				this.tooltipObjects.texts[idx].attr( { x:this.tooltipData.x + textOff,
					 								   y:PULSE.Browser.y( label.y ),
					 								   text:label.string,
					 								   'text-anchor':anchor,
					 								   opacity:1 } );
			}
			else
			{
				this.tooltipObjects.bgs[idx].attr( { opacity:0 } );
				this.tooltipObjects.texts[idx].attr( { opacity:0 } );
			}

			idx++;
		}

		// If there were dismissals associated with this value, or one very close to it,
		// then display this information in the top-left corner
		this.dismissal.remove();
		if ( this.dismissalData !== undefined )
		{
			var d = '';
			for ( dd = 0, ee = this.dismissalData.length; dd < ee; dd++ )
			{
				if ( dd !== 0 )
				{
					if ( dd === ee - 1 )
					{
						d += ' and ';
					}
					else
					{
						d += ', ';
					}
				}
				d += this.dismissalData[dd];
			}

			var tf = new PULSE.RaphaelTextField( this.config.dismissalTextField );
			tf.addLine( d + ' dismissed' );
			tf.render( this.ctx.r, this.dismissal );
		}
	}
	else
	{
		// Reset all components to 0 opacity to hide them
		for ( var prop in this.tooltipObjects )
		{
			if ( this.tooltipObjects[prop].length )
			{
				for ( var i = 0, ilimit = this.tooltipObjects[prop].length; i < ilimit; i++ )
				{
					this.tooltipObjects[prop][i].attr( { opacity:0 } );
				}
			}
			else
			{
				this.tooltipObjects[prop].attr( { opacity:0 } );
			}
		}
	}
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.renderSeries = function ( r, series, color, label )
{
	// Create the line
	var path = 'M';
	for ( var i = 0, j = series.length; i < j; i++ )
	{
		if ( i > 0 )
		{
			path += 'L';
		}
		
		var item = series[i];
		var x = this.config.xAxis.project( item.x );
		var y = this.config.yAxis.project( item.y );
		
		path += x + ' ' + y;
		
		// Retrieve or create the tooltip cache
		var index = Math.round( x );
		var cacheRecord = this.tooltipDataCache[ index ];
		if ( !cacheRecord )
		{
			cacheRecord = { x:x, labels:{} };
			this.tooltipDataCache[ index ] = cacheRecord;
		}
		
		// Add a label into the record
		var rec = { string:label + ': ' + Math.round( item.y ) + '%', y:y };
		if ( item.dismissals !== undefined )
		{
			rec.z = item.dismissals.length;
			cacheRecord.dismissals = item.dismissals;
		}
		cacheRecord.labels[ label ] = rec;
	}
	r.path( path ).attr( { stroke:color, fill:'none', 'stroke-width':3 } );
	
	// Create the wicket falls
	for ( var i = 0, j = series.length; i < j; i++ )
	{
		var item = series[i];
		if ( item.z > 0 )
		{
			var x = this.config.xAxis.project( item.x );
			var y = this.config.yAxis.project( item.y );

			for ( var k = 0, l = item.z; k < l; k++ )
			{
				r.circle( x, y - ( k * this.config.fow.size ), this.config.fow.size / 2 )
				 .attr( { fill:color, stroke:this.config.fow.stroke , 'stroke-width':1 } );
			}
		}
	}
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.addData = function ( series, x, likelihoods, battingIndex, dismissals )
{
	// Add the 3 values to the 3 series
	for ( var k = 0; k < 3; k++ )
	{
		// Remember to normalise y value to 0-100 from 0-1000
		var item = { x:x, y:likelihoods[k]/10, z:0 };
		if ( dismissals.length > 0 && k === battingIndex * 2 )
		{
			item.z = dismissals.length;
			item.dismissals = dismissals;
		}
		
		series[k].push( item );
	}
};

PULSE.RaphaelWinLikelihoodRenderer.prototype.onMouse = function ( event )
{
	var xy = Utils.getXY( event );
	var ttd = undefined;
	
	if ( xy !== undefined && xy.y >= this.config.yAxis.end && xy.y <= this.config.yAxis.start &&
			xy.x >= this.config.xAxis.start && xy.x <= this.config.xAxis.end )
	{
		ttd = this.tooltipDataCache[ xy.x ];
		
		var search = xy.x;
		while ( ttd === undefined && search >= this.config.xAxis.start )
		{
			search--;
			// If there was no data for this x value, try using one to the left
			ttd = this.tooltipDataCache[ search ];
		}
		
		// Also search for dismissals close by, so the mouse doesn't have to be exactly on it
		if ( ttd === undefined || ttd.dismissals === undefined )
		{
			var dismissalData = undefined;
			for ( var offset = 1; offset <= 3; offset++ )
			{
				var neighbour = this.tooltipDataCache[ xy.x - offset ];
				if ( neighbour !== undefined && neighbour.dismissals !== undefined )
				{
					dismissalData = neighbour.dismissals;
					break;
				}
				neighbour = this.tooltipDataCache[ xy.x + offset ];
				if ( neighbour !== undefined && neighbour.dismissals !== undefined )
				{
					dismissalData = neighbour.dismissals;
					break;
				}
			}
		}
		else
		{
			dismissalData = ttd.dismissals;
		}
	}

	if ( ttd !== this.tooltipData || dismissalData !== this.dismissalData )
	{
		this.tooltipData = ttd;
		this.dismissalData = dismissalData;
			
		this.updateTooltip();
	}
};

/*************************/
/* Local utility methods */
/*************************/

obtainVariant = function ( config, db )
{
	// Work out match type
	var mt = db.getMatchType();	
	
	if ( CricketMatchType.ODI === mt )
	{
		return config.variants.odi;
	}
	else if ( CricketMatchType.T20 === mt )
	{
		return config.variants.t20;
	}
	else if ( CricketMatchType.TEST === mt )
	{
		return config.variants.test;
	}
};

if ( !PULSE ) { var PULSE = {}; }

PULSE.RaphaelTrajectoryRenderer = function ( config )
{
	this.config = config;
	this.timerId = null;
	this.animationPeriod = null;
	this.time = null;
	this.speed = config.speed;
	this.viewIndex = 0;
	
	// Configurable properties of the renderer
	this.defer = true;
	this.renderBounce = true;
	this.renderEnd = true;

	PULSE.RaphaelTrajectoryRenderer.prototype.augmentConfig = function ()
	{
		if ( this.viewIndex < this.config.views.length )
		{
			var subconfig = this.config.views[ this.viewIndex ];
			for ( var property in subconfig )
			{
				this.config[ property ] = subconfig[ property ];
			}
		}
	};

	this.augmentConfig();
};

PULSE.RaphaelTrajectoryRenderer.prototype.setView = function ( viewIndex )
{
	this.resetRendering();
	this.viewIndex = viewIndex;
	this.augmentConfig();
	this.controller.setBackground( this.config.background );
	this.controller.setMask( this.config.mask );
};

PULSE.RaphaelTrajectoryRenderer.prototype.nextView = function ()
{
	var viewIndex = this.viewIndex + 1;
	if ( viewIndex >= this.config.views.length )
	{
		viewIndex = 0;
	}
	this.setView( viewIndex );
};		

/**
 * This function augments the renderers configuration with the configuration contained in
 * the current view.
 */
PULSE.RaphaelTrajectoryRenderer.prototype.setSpeed = function ( speed )
{
	this.speed = speed;
};
	
PULSE.RaphaelTrajectoryRenderer.prototype.showDescription = function ()
{
	if ( this.data.length > this.activeBall )
	{
		PULSE.GraphController.setInfo( this.data[ this.activeBall ].generateDescription(), true );
		if ( PULSE.GraphController.updateLatestTrajInfo )
		{
			PULSE.GraphController.updateLatestTrajInfo( this.data[ this.activeBall ] );
		}
	}
};

PULSE.RaphaelTrajectoryRenderer.prototype.render = function ( db, data, ctx, immediate )
{
	ctx.r.clear();
	
	PULSE.Tracer.info( 'TrajectoryRenderer.render called with immediate=' + immediate );
	
	// Ensure view is correctly set 
	this.augmentConfig();
	this.controller.setBackground( this.config.background );
	this.controller.setMask( this.config.mask );
	
	if ( this.defer && !immediate )
	{
		// If there is no data, return
		if ( data === undefined || data === null || data.length === 0 )
		{
			PULSE.Tracer.info( 'No data, returning' );
			return;
		}
		// Never render this data immediately, unless this is the first render attempt, as it
		// will force the animation to restart.
		else if ( this.deferredRenderCall !== undefined )
		{
			// We have previously set data, so save the call as deferred and return. The deferred
			// data will be used once the current animation loop has ended.
			PULSE.Tracer.info( 'Deferring call' );
			
			this.deferredRenderCall = { db:db, data:data, ctx:ctx };
			return;
		}
		else
		{
			// Otherwise continue, but give the deferred data a null value so that we know we
			// have now rendered
			PULSE.Tracer.info( 'Continuing' );
			
			this.deferredRenderCall = null;
		}
	}
	
	// Save balls, up to the maximum
	if ( this.config.maxBalls !== undefined )
	{
		this.data = data.slice( 0, this.config.maxBalls );		
	}
	else
	{
		this.data = data;
	}

	// Only use balls that have valid trajectories
	var validData = [];
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		var row = this.data[i];
		var traj = row.get( CricketField.TRAJECTORY );

		if ( traj !== undefined && traj.trackApproved )
		{
			validData.push( row );
		}
	}
	this.data = validData;
		
	// Save the context, as we need it in the timer callback
	this.ctx = ctx;
	
	// Reset render/offset array
	this.renderData = [];
	this.activeBall = 0;
	this.offsets = [0];

	this.showDescription();
	
	// Iterate over balls to find start/end/offset times
	var anim = { start:Number.MAX_VALUE, end:Number.MIN_VALUE };
	
	PULSE.Tracer.info( 'Rendering ' + this.data.length + ' trajectories' );
	
	var total = 0;
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		// Obtain trajectory
		var row = this.data[i];
		var traj = row.get( CricketField.TRAJECTORY );

		PULSE.Tracer.info( 'Traj ' + i + ' period ' + Utils.toString( traj.period, true ) );
		
		if ( 'serial' === this.config.ordering )
		{
			// Update total
			var length = traj.period.end - traj.period.start;
			total += length;
			
			// First traj
			if ( i === 0 )
			{
				anim.start = 0;
			}
			
			// Last traj (can also be the first!)
			if ( i === j-1 )
			{
				anim.end = total + this.config.timeMargin.end;
			}
			
			this.offsets[ i+1 ] = total;
		}
		else
		{
			// Parallel processing
			var start = traj.period.start - this.config.timeMargin.start;
			var end = traj.period.end + this.config.timeMargin.end;
			
			if ( start < anim.start )
			{
				anim.start = start;
			}
			if ( end > anim.end )
			{
				anim.end = end;
			}
		}
	}
	
	PULSE.Tracer.info( 'Offsets: ' + Utils.toString( this.offsets, true ) );
	
	// Set up timing parameters
	this.animationPeriod = anim;
	this.time = this.animationPeriod.start;
	
	PULSE.Tracer.info( 'Animation period is ' + Utils.toString( anim, true ) ); 
	
	// Start timer, stopping any previous one
	if ( this.timerId !== null )
	{
		clearInterval( this.timerId );
	}
	
	var that = this;
	this.timerId = setInterval( function() { that.increment(); }, this.config.refresh );
};
	
PULSE.RaphaelTrajectoryRenderer.prototype.unrender = function ()
{
	this.deferredRenderCall = undefined;
	if ( this.timerId !== null )
	{
		clearInterval( this.timerId );
		this.timerId = null;
	}
};
	
PULSE.RaphaelTrajectoryRenderer.prototype.resetRendering = function ()
{
	if ( this.animationPeriod && this.data )
	{
		this.time = this.animationPeriod.start;
		this.renderData = [];
		this.activeBall = 0;
		this.showDescription();
		
		this.ctx.r.clear();

		if ( this.deferredRenderCall )
		{
			// We have a deferred render call outstanding, so make that call now
			PULSE.Tracer.info( 'Making deferred rendering call' );
			this.render( this.deferredRenderCall.db, this.deferredRenderCall.data, this.deferredRenderCall.ctx, true );
			
			// Reset the render call data
			this.deferredRenderCall = null;
		}
	}

};

/**
 * Utility method to get render data for a given trajectory at a given point in time.
 */
PULSE.RaphaelTrajectoryRenderer.addRenderData = function ( i, config, rd, traj, time )
{
	// Obtain ball-on-screen information
	var bos = PULSE.RaphaelTrajectoryRenderer.getBallOnScreen( config, traj, time );

	// Add the data to the paths
	if ( !rd.shadowPath )
	{
		rd.shadowPath = 'M';
		rd.trailPath = 'M';
	}
	else
	{
		rd.shadowPath += 'L';
		rd.trailPath += 'L';
	}
		
	rd.shadowPath += bos.shadow.x + ' ' + bos.shadow.y;
	rd.trailPath += bos.ball.x + ' ' + bos.ball.y;
	
	// Obtain colours
	var trailColor = config.trailColors[i % config.trailColors.length];

	// Update Raphael objects
    rd.trail.attr( { path:rd.trailPath, stroke:trailColor, 'stroke-width':4, 'stroke-linejoin':'round', opacity:config.trailOpacity } ).toFront();
    rd.shadow.attr( { path:rd.shadowPath, stroke:config.shadowStyle, 'stroke-width':4, opacity:config.shadowOpacity } ).toBack();
    rd.ball.attr( { x:bos.ball.x - bos.size, y:bos.ball.y - bos.size, width:bos.size * 2, height:bos.size * 2 } ) 
           .toFront();
};

/**
 * Increments the point in time the animation is currently representing. 
 */
PULSE.RaphaelTrajectoryRenderer.prototype.increment = function ()
{
	this.time += ( this.config.interval * this.speed );
	
	if ( this.time > this.animationPeriod.end )
	{
		this.resetRendering();
	}
	
	// Move onto next active ball if we need to
	if ( this.time > this.offsets[ this.activeBall + 1 ] )
	{
		if ( this.renderEnd )
		{
			// Ensure we have rendered the last point for the current ball
			var thisTraj = this.data[this.activeBall].get( CricketField.TRAJECTORY );
			var thisRd = this.renderData[this.activeBall];

			PULSE.RaphaelTrajectoryRenderer.addRenderData( 
					this.activeBall, this.config, thisRd, thisTraj, thisTraj.period.end );
		}
		
		this.activeBall++;
		this.showDescription();
	}
	
	// Add render data for the active ball
	for ( var i = 0, j = this.data.length; i < j; i++ )
	{
		if ( 'parallel' === this.config.ordering || i === this.activeBall )
		{
			// Obtain trajectory
			var row = this.data[i];
			var traj = row.get( CricketField.TRAJECTORY );
			
			// Create or obtain render data for this traj
			var rd = this.renderData[i];
			if ( !rd )
			{
				rd = {};
				rd.shadowPath = '';
				rd.trailPath = '';
				rd.shadow = this.ctx.r.path();
				rd.trail = this.ctx.r.path();
				
				var img = 'images/balls/12px/phe_red_ball.png';
				rd.ball = this.ctx.r.image( img, 0, 0, 0, 0 );
				
				this.renderData[i] = rd;
			}
	
			var offset = this.offsets[i] === undefined ? 0 : this.offsets[i];
			var t1 = this.time - offset + traj.period.start;
			
			PULSE.RaphaelTrajectoryRenderer.addRenderData( i, this.config, rd, traj, t1 );
			
			// Check to see if the next timing point is after the bounce time; if it is,
			// add the bounce time render point now
			if ( this.renderBounce )
			{
				var t2 = t1 + ( this.config.interval * this.config.speed );
				if ( t1 < traj.bt && t2 > traj.bt )
				{
					PULSE.RaphaelTrajectoryRenderer.addRenderData( i, this.config, rd, traj, traj.bt );
				}
			}
		}
	}
};
	
/**
 * Gets screen-based ball information for a given time. Returns an object with properties:
 * 
 * shadow   { x, y } - on-screen location of shadow
 * ball     { x, y } - on-screen location of ball
 * size              - on-screen ball radius
 */
PULSE.RaphaelTrajectoryRenderer.getBallOnScreen = function ( config, traj, time )
{
	// Get ball position in real-world coordinates
	var xyz;
	
	if ( time > traj.period.end )
	{
		xyz = traj.getPositionAtTime( traj.period.end );
	}
	else if ( time < traj.period.start )
	{
		xyz = traj.getPositionAtTime( traj.period.start );
	}
	else
	{
		xyz = traj.getPositionAtTime( time );
	}
	
	// Approximate the ball size
	var size = config.ballSize.max - ( xyz.x * ( ( config.ballSize.max - 
										config.ballSize.min ) /
										config.releaseX ) );

	// Convert to VR coordinates
	xyz.x -= 10.06;

	// Project shadow
	var shadowScreen = config.projection.project( { x:xyz.x, y:xyz.y, z:0 } );
	
	// Project ball
	var ballScreen = config.projection.project( xyz );
	
	// Return object
	return { shadow:shadowScreen, ball:ballScreen, size:size }; 
};
// Create the namespace if it doesn't already exist
if ( !PULSE ) { var PULSE = {}; }

/**
 * JSONP callback function for UDS data handling.
 */
function udsData( json )
{
	var bowlerSpeeds = {};
	var highestInnings = 0;
	var lastKeys = {};
	
	var countingBallDelta = 0;
	
	var data = {};
	
	for ( var i = 0, j = json[0].data.length; i < j; i++ )
	{
		var obj = json[0].data[i];
		for ( var key in obj )
		{
			var rec = new PULSE.UdsHawkeyeRecord( key, obj[ key ] );
			data[ key ] = rec;
			
			var ballNum = +rec.get( CricketField.BALL ); 
			if ( ballNum === 1 )
			{
				// First ball, so reset the countingBallDelta
				countingBallDelta = 0;
			}
			
			// Set the counting ball
			rec.countingBall = ballNum - countingBallDelta;
			
			// Update delta
			if ( !rec.get( CricketField.IS_COUNTING ) )
			{
				countingBallDelta++;
			}
			
			// We also need to record the first valid bowl speed for each bowler, so we
			// can tell whether they are a spin or seam bowler; it might be better to store
			// the average rather that the first one?!
			var bowler = rec.get( CricketField.BOWLER );
			if ( !Utils.isNullish( bowler ) && bowlerSpeeds[bowler] === undefined )
			{
				var speed = rec.get( CricketField.BOWL_SPEED );
				if ( !Utils.isNullish( speed ) )
				{
					var s = +speed;
					if ( s > 30 )
					{
						bowlerSpeeds[bowler] = s < 70 ? CricketBowlerSpeed.SPIN : 
														CricketBowlerSpeed.SEAM;
					}
				}
			}
			
			var innings = rec.get( CricketField.INNINGS );
			if ( innings > highestInnings )
			{
				highestInnings = innings;
			}
			
			lastKeys.all = key;
			if ( rec.hasTrajData() )
			{
				lastKeys.traj = key;
			}
		}
	}
	
	// Now go back through the data applying the bowlerSpeed property. We should look at a
	// better way of doing this - maybe storing the lookup in the metadata
	for ( var key in data )
	{
		var rec = data[ key ];
		var bowler = rec.get( CricketField.BOWLER );
		if ( !Utils.isNullish( bowler ) )
		{
			rec.bowlerSpeed = bowlerSpeeds[bowler];
		}
	}
		
	// Update prototype to return this data
	PULSE.UdsHawkeyeDatabase.prototype.getData = function() { return data; };
	PULSE.UdsHawkeyeDatabase.prototype.getMetadata = function() { return json[0].meta; };
	PULSE.UdsHawkeyeDatabase.prototype.getHighestInnings = function() { return highestInnings; };
	PULSE.UdsHawkeyeDatabase.prototype.getLastKeys = function() { return lastKeys; };
	
	// Inform listeners of the update
	PULSE.UdsHawkeyeDatabase.getInstance().informListener();
}

/**
 * JSONP callback function for UDS metadata handling.
 */
function udsMetadata( json )
{
	var lastUpdated = json[0].meta[ 'last_updated' ];
	
	if ( lastUpdated !== undefined && PULSE.UdsHawkeyeDatabase.lastUpdated !== lastUpdated )
	{
		PULSE.Tracer.info( 'LastUpdated has changed, reloading UDS data' );
		PULSE.UdsHawkeyeDatabase.lastUpdated = lastUpdated;
		PULSE.UdsHawkeyeDatabase.updateCallback();
	}
	
	//stop gap solution for getting team names into client
	if(typeof _ !== "undefined" && _.isEmpty(PULSE.UdsHawkeyeDatabase.prototype.getMetadata())){
		PULSE.UdsHawkeyeDatabase.prototype.getMetadata = function() { return json[0].meta; };
		PULSE.UdsHawkeyeDatabase.getInstance().informListener();
	}
};

/**
 * Constructor. No-op: data load deferred to loadGame call
 */
PULSE.UdsHawkeyeDatabase = function ( listener )
{
	// Constants
	PULSE.UdsHawkeyeDatabase.LOADER_SCRIPT_ID = 'udsLoaderScript';
	PULSE.UdsHawkeyeDatabase.UDSMETA_URL_SUFFIX = '/uds-meta.js';

	PULSE.UdsHawkeyeDatabase.BALL_RUNS_PREFIX = ' <span>';
	PULSE.UdsHawkeyeDatabase.BALL_RUNS_SUFFIX = '</span>';
	
	// This is where the CDN setup code goes. There are currently 3 supported environments
	// and you should comment in the two lines appropriate to the target environment 
	
	// Lee's testing only
	//PULSE.UdsHawkeyeDatabase.URL_PREFIX = 'http://dynamic.pulselive.com/dynamic/';
	//PULSE.UdsHawkeyeDatabase.UDS_URL_SUFFIX = '/uds.jsonp';
	// Playdev testing only
	//PULSE.UdsHawkeyeDatabase.URL_PREFIX = 'http://dynamic.pulselive.com/test/';
	//PULSE.UdsHawkeyeDatabase.UDS_URL_SUFFIX = '/uds.json.jgz';
	// Production
	PULSE.UdsHawkeyeDatabase.URL_PREFIX = 'http://dynamic.pulselive.com/dynamic/';
	PULSE.UdsHawkeyeDatabase.UDS_URL_SUFFIX = '/uds.json.jgz';
	
	// Set up instance accessor
	var that = this;
	PULSE.UdsHawkeyeDatabase.getInstance = function () { return that; };
	
	// Save listener reference
	this.listener = listener;
	
	// Seed state
	this.nullData();
};

/**
 * Informs the listener of new data becoming available.
 */
PULSE.UdsHawkeyeDatabase.prototype.informListener = function ()
{
	if ( this.listener !== null )
	{
		this.listener.inform( this );
	}
};

/**
 * Sets the listener for updates to the data.
 */
PULSE.UdsHawkeyeDatabase.prototype.setListener = function ( listener )
{
	this.listener = listener;
};

/**
 * Provide no-ops for getData, getMetadata and getHighestInnings.
 */
PULSE.UdsHawkeyeDatabase.prototype.nullData = function () 
{
	PULSE.UdsHawkeyeDatabase.prototype.getData = function()
	{ 
		return [];
	};
	PULSE.UdsHawkeyeDatabase.prototype.getMetadata = function()
	{ 
		return {};
	};
	PULSE.UdsHawkeyeDatabase.prototype.getHighestInnings = function()
	{
		return 0;
	};
	PULSE.UdsHawkeyeDatabase.prototype.getLastKeys = function()
	{
		return {};
	};
};

/**
 * Provides a generic dynamic script loading method, for JSONP injection.
 * 
 * @param path the cross-site path we want to load from
 */
PULSE.UdsHawkeyeDatabase.dynamicScriptLoad = function ( path )
{
	PULSE.Tracer.info( 'Dynamic script load from ' + path );

	// Unload any existing script
	var script = document.getElementById( PULSE.UdsHawkeyeDatabase.LOADER_SCRIPT_ID );
	if ( script !== null )
	{
		script.parentNode.removeChild( script );
	}
	
	// Use dynamic JavaScript insertion with JSONP to get the data from a different domain
	script = document.createElement( 'script' );
	script.setAttribute( 'id', PULSE.UdsHawkeyeDatabase.LOADER_SCRIPT_ID );
	script.setAttribute( 'src', path + '?t=' + ( +new Date() ) );

	// Attach the script to the head, hence invoking its contents
	document.getElementsByTagName('head')[0].appendChild( script );
};

/**
 * Checks to see if the data has been updated since the last time the data was read
 * using the readData method. If it has, then invoke the callback.
 */
PULSE.UdsHawkeyeDatabase.prototype.checkForUpdate = function ( callback )
{
	// Save the update callback reference
	PULSE.UdsHawkeyeDatabase.updateCallback = callback;
	
	// Obtain the metadata via JSONP callback
	var path = PULSE.UdsHawkeyeDatabase.URL_PREFIX + this.customer + '/' + this.gameId + 
			   PULSE.UdsHawkeyeDatabase.UDSMETA_URL_SUFFIX;
	PULSE.UdsHawkeyeDatabase.dynamicScriptLoad( path );
};

/**
 * Dynamically sets the UDS game ID and forces a load from the derived path.
 */
PULSE.UdsHawkeyeDatabase.prototype.loadGame = function ( gameId, customer )
{	
	// Unload current game
	this.nullData();
	this.informListener();
	
	var thisCustomer = customer;
	if ( Utils.isNullish( thisCustomer ) )
	{
		thisCustomer = 'cricinfo';
	}
	
	PULSE.UdsHawkeyeDatabase.lastUpdated = null; 
	this.gameId = gameId;
	this.customer = thisCustomer;
	
	// Stop any existing monitor
	if ( this.dataMonitor !== undefined )
	{
		this.dataMonitor.stop();
		PULSE.Tracer.info( 'DataMonitor stopped' );
	}
	
	// Create a data monitor for the game and let that do the work
	this.dataMonitor = new PULSE.DataMonitor( 30000, this, function () 
	{
		// If the monitor triggers, load the full JSONP data  
		var path = PULSE.UdsHawkeyeDatabase.URL_PREFIX + thisCustomer + '/' + gameId + 
				   PULSE.UdsHawkeyeDatabase.UDS_URL_SUFFIX;
		PULSE.UdsHawkeyeDatabase.dynamicScriptLoad( path );
	} );
	this.dataMonitor.start();
	PULSE.Tracer.info( 'DataMonitor started' );
};

/**
 * Sets whether the active datamonitor actually does any downloading of metadata.
 */
PULSE.UdsHawkeyeDatabase.prototype.setActive = function ( active )
{
	if ( this.dataMonitor !== undefined )
	{
		this.dataMonitor.downloading = active;
	}
};

/**
 * Loads the data from the actual UDS file on the CDN.
 */
PULSE.UdsHawkeyeDatabase.prototype.loadData = function ()
{
	var path = PULSE.UdsHawkeyeDatabase.URL_PREFIX + this.customer + '/' + this.gameId + 
			   PULSE.UdsHawkeyeDatabase.UDS_URL_SUFFIX;
	//var path = "file:///C:/svn/dev2/trunk/javascript/projects/cricket/pulse-telegraph/src/uds.json";
	PULSE.UdsHawkeyeDatabase.dynamicScriptLoad( path );
};

/**
 * Normalises the data contained in the given coordinate to 'standard' (VR) coordinates.
 */
PULSE.UdsHawkeyeDatabase.prototype.normalise = function ( xyz )
{
	return { x:xyz.x-10.06, y:xyz.y, z:xyz.z };
};

/**
 * Gets the match type for this match.
 */
PULSE.UdsHawkeyeDatabase.prototype.getMatchType = function ()
{
	var mt = CricketMatchType.TEST;

	var overs = this.getMetadata()[ 'overs' ];
	if ( overs === '20' )
	{
		mt = CricketMatchType.T20;
	}
	else if ( overs === '50' )
	{
		mt = CricketMatchType.ODI;
	}
	
	return mt;
};

/**
 * Gets the participant data for this match.
 */
PULSE.UdsHawkeyeDatabase.prototype.getParticipants = function ()
{
	return [ new Participant( this.getMetadata()[ 'participant_1' ] ),
	         new Participant( this.getMetadata()[ 'participant_2' ] ) ];
};

/**
 * Gets scoring data for this match.
 */
PULSE.UdsHawkeyeDatabase.prototype.getScoring = function ()
{
	var score = new PULSE.UdsScore( this.getData(), this.getBattingOrder(), this.getLastKeys().all );
	
	return score;
};

/**
 * Gets the batting team index (0 or 1) in the given 1-based innings number.
 */
PULSE.UdsHawkeyeDatabase.prototype.getBattingTeamIndex = function ( innings )
{
	var order = this.getMetadata()[ 'batting_order' ];
	if ( order && order.length >= innings )
	{
		var idx = +order.charAt( innings - 1 );
		return idx - 1;
	}
	else
	{
		// Something went wrong, as we are asking for an innings that doesn't exist
		// in the batting order; so, just return something
		return 1;
	}
};

/**
 * Gets an array of batting team indexes (0 or 1)
 * @return battingOrder: array
 */
PULSE.UdsHawkeyeDatabase.prototype.getBattingOrder = function ()
{
	var battingOrder = [];
	var order		 = this.getMetadata()[ 'batting_order' ];
	
	if ( order && order.length )
	{
		for(var i = 0; i < order.length; i++) {
			var idx = +order.charAt( i );
			battingOrder.push(idx);
		}
	}
	return battingOrder;
};

/**
 * Gets the innings string for the given innings.
 * 
 * @param innings the 1-based innings number
 * @return the innings string (e.g. Zimbabwe innings, India 2nd innings)
 */
PULSE.UdsHawkeyeDatabase.prototype.getInningsString = function ( innings )
{
	var battingIndex = this.getBattingTeamIndex( innings );
	var participant = this.getParticipants()[ battingIndex ];
	
	// Seed string with participant name
	var string = participant.fullName;
	
	// If we are in a Test match, add 1st/2nd
	if ( this.getMatchType() === CricketMatchType.TEST )
	{
		string += ( innings <= 2 ? ' 1st' : ' 2nd' );
	}

	// Add 'innings'
	string += ' innings';
	return string;	
};

/**
 * Converts an innings string back into the 1-based innings index. This is essentially the
 * inverse function of getInningsString
 * 
 * @param string the innings string
 * @return the matching 1-based innings, using Levenshtein matching 
 */
PULSE.UdsHawkeyeDatabase.prototype.getInningsFromString = function ( string )
{
	// Build array of all available strings
	var candidates = [];
	var inningsLookup = {};
	for ( var i = 1, j = this.getHighestInnings(); i <= j; i++ )
	{
		var is = this.getInningsString( i );

		candidates.push( is );
		inningsLookup[ is ] = i;
	}
	
	// Now do a Levenshtein match of the input string
	var matched = PULSE.Levenshtein.bestMatch( candidates, string );
		
	// Return the innings number
	return inningsLookup[ matched ];
};

/**
 * Obtains the set of unique values for all filter options, given the optional filter.
 * 
 * @param filter (optional) the initial filter
 * @return an object keyed by the option name, each containing an array of possible values
 */
PULSE.UdsHawkeyeDatabase.prototype.getOptions = function ( filter )
{
	PULSE.Tracer.info( 'getOptions with filter=' + Utils.toString( filter ) ); 
	
	var options = { innings:{}, batsman:{}, bowler:{}, over:{}, ball:{} };
	
	var d = this.getData();
	for ( var key in d )
	{
		var record = d[ key ];
		
		if ( record.satisfiesFilter )
		{
			// Check to see if this record satisfies the given filter, but be careful to allow
			// through all value that are being used as a filter 
			var satisfy = record.satisfiesFilter( filter );
			
			var s = record.get( CricketField.INNINGS );
			if ( !Utils.isNullish( s ) && ( satisfy || !Utils.isNullish( filter.innings ) ) )
			{
				// Convert innings to descriptive string
				s = this.getInningsString( +s );
				options.innings[s] = undefined;
			}
			s = record.get( CricketField.BATSMAN );
			if ( !Utils.isNullish( s ) && ( satisfy || !Utils.isNullish( filter.batsman ) ) )
			{
				options.batsman[s] = undefined;
			}
			s = record.get( CricketField.BOWLER );			
			if ( !Utils.isNullish( s ) && ( satisfy || !Utils.isNullish( filter.bowler ) ) )
			{	
				options.bowler[s] = undefined;
			}
			s = record.get( CricketField.INNINGS ) + '.' + record.get( CricketField.OVER );
			if ( !Utils.isNullish( s ) && ( satisfy || !Utils.isNullish( filter.over ) ) )
			{
				options.over[s] = undefined;
			}
			s = record.get( CricketField.BALL );
			if ( !Utils.isNullish( s ) && ( satisfy || !Utils.isNullish( filter.ball ) ) )
			{
				// Additionally check that the innings/over matches, if we are in a specific over
				var add = true;
				if ( filter && CricketFilter.WATCHLIVE !== filter.over )
				{
					var secondaryFilter = { innings:filter.innings, over:filter.over };
					add = record.satisfiesFilter( secondaryFilter );
				}
				
				if ( add )
				{
					var extended = record.get( CricketField.COUNTING_BALL );
					
					var summary = Utils.trim( record.generateSummary( true ) );
					if ( summary.length > 0 )
					{
						extended += PULSE.UdsHawkeyeDatabase.BALL_RUNS_PREFIX + summary +
									PULSE.UdsHawkeyeDatabase.BALL_RUNS_SUFFIX; 
					}
					
					options.ball[s] = extended;
				}
			}
		}
	}

	//PULSE.Tracer.info( 'getOptions returned ' + Utils.toString( options ) );
	
	return options;
};

/**
 * Looks up a player ID from a name.
 */
PULSE.UdsHawkeyeDatabase.prototype.lookupPlayer = function ( name )
{
	// In this implementation, the ID is simply the name
	return name;
};

/**
 * Gets the 'class' name for this database.
 */
PULSE.UdsHawkeyeDatabase.prototype.getType = function ()
{
	return 'UdsHawkeyeDatabase';
};

/**
 * Obtains a coordinate-space specific value from this database.
 */
PULSE.UdsHawkeyeDatabase.prototype.getParameter = function ( key )
{
	if ( 'ww-sign' === key )
	{
		return 1;
	}
	else if ( 'ww-origin-x' === key )
	{
		return -11;
	}	
};

PULSE.UdsHawkeyeDatabase.prototype.getInningsList = function()
{	
	var allInnings = [];
	var previousInnings = '';
	var d = this.getData();
	for ( var key in d )
	{
		if(d.hasOwnProperty(key)) {
			var record = d[ key ];
			var s = record.get( CricketField.INNINGS );
			s = this.getInningsString( +s );
			if( s && s !== previousInnings )
			{
				allInnings[allInnings.length] = s;
			}
			previousInnings = s;
		}
	}
			
	return allInnings;
};

// Create the namespace if it doesn't already exist
if ( !PULSE ) { var PULSE = {}; }

/**
 * Wrapper for a record from a UDS file.
 */
PULSE.UdsHawkeyeRecord = function ( rawBp, rawData )
{
	this.fields = rawData.split( ',' );
	this.bp = new PULSE.BallProgress( rawBp );
	this.traj = null;
};

/**
 * Returns true if this record satisfies the given filter.
 */
PULSE.UdsHawkeyeRecord.prototype.satisfiesFilter = function ( filter )
{
	if ( filter === undefined )
	{
		return true;
	}
	else
	{
		// First check a *.*.All match on the over filter
/*		if ( filter.over !== undefined && filter.over.match( /[0-9]+\.[0-9]+\.All/ ) !== null )
		{
			var sample = filter.over.replace( /All/, '0' );
			var sampleBp = new PULSE.BallProgress( sample );
			
			return ( this.bp.innings === sampleBp.innings &&
					 this.bp.over === sampleBp.over );
		}
*/		
		// Check innings, over and ball, allowing for All 
		var inn = Utils.isNullish( filter.innings ) || 
				  CricketFilter.ALL === filter.innings ||
				  this.get( CricketField.INNINGS ) == filter.innings.toString(); // Coerce!
		
		var over = Utils.isNullish( filter.over ) || 
		   		   CricketFilter.ALL === filter.over ||
		   		   this.get( CricketField.OVER ) == filter.over; // Coerce!

		var ball = Utils.isNullish( filter.ball ) || 
		   		   CricketFilter.ALL === filter.ball ||
		   		   CricketFilter.ALLBALLS === filter.ball ||
		   		   this.get( CricketField.BALL ) == filter.ball; // Coerce!

		if ( inn && over && ball )
		{
			// Check batsman
	    	var lh = this.get( CricketField.HANDEDNESS ) === CricketHandedness.LEFT;
			var ba = Utils.isNullish( filter.batsman ) || 
					 CricketFilter.ALL === filter.batsman ||
					 CricketFilter.ALLBATSMEN === filter.batsman ||
					 ( !lh && CricketFilter.RIGHTHANDERS === filter.batsman ) || 
					 (  lh && CricketFilter.LEFTHANDERS === filter.batsman ) ||
					 this.get( CricketField.BATSMAN ) === filter.batsman;
					 
			// Check bowler
			var spin = this.get( CricketField.BOWLER_SPEED ) === CricketBowlerSpeed.SPIN;
			var bo = Utils.isNullish( filter.bowler ) || 
					 CricketFilter.ALL === filter.bowler ||
					 CricketFilter.ALLBOWLERS === filter.bowler ||
					 (  spin && CricketFilter.SPINBOWLERS === filter.bowler ) || 
					 ( !spin && CricketFilter.SEAMBOWLERS === filter.bowler ) ||
					 this.get( CricketField.BOWLER ) === filter.bowler;
			
			return ba && bo;
	    }
		
    	return false;
	}
};

/**
 * Obtains a field (column) from this record.
 */
PULSE.UdsHawkeyeRecord.prototype.get = function ( field )
{
	switch ( field )
	{
		case CricketField.ID:
			return this.bp.description();
	
		case CricketField.BATSMAN:
			return this.fields[0];
			
		case CricketField.BOWLER:
			return this.fields[2];
			
		case CricketField.INNINGS:
			return this.bp.innings;
			
		case CricketField.OVER:
			return this.bp.over;
			
		case CricketField.BALL:
			return this.bp.ball;
			
		case CricketField.COUNTING_BALL:
			return this.countingBall;
			
		case CricketField.WW:
			if ( Utils.isNullish( this.fields[11] ) || Utils.isNullish( this.fields[12] ) )
			{
				return undefined;
			}
			else
			{
				return { x:this.fields[11], y:this.fields[12] };
			}
			
		case CricketField.RUNS:
			if ( this.fields[16].length > 0 )
			{
				return this.fields[16];
			}
			else
			{
				return 0;
			}
			
		case CricketField.CREDIT:
			if ( this.fields[17].length === 0 )
			{
				return this.get( CricketField.RUNS );
			}
			else
			{
				return this.fields[17];
			}
			
		case CricketField.DEBIT:
			if ( this.fields[18].length === 0 )
			{
				return this.get( CricketField.RUNS );
			}
			else
			{
				return this.fields[18];
			}
			
		case CricketField.PITCHED:
			if ( this.fields[4].length === 0 )
			{
				return undefined;
			}
			return { x:this.fields[4], y:this.fields[5], z:0 };
			
		case CricketField.IS_WICKET:
			return this.fields[14].length > 0;
			
		case CricketField.STUMPS:
			if ( this.fields[7].length === 0 )
			{
				return undefined;
			}
			return { x:0, y:this.fields[7], z:this.fields[8] };
			
		case CricketField.TRAJECTORY:
			if ( this.traj === null )
			{
				this.traj = PULSE.UdsHawkeyeRecord.parseTrajectory( this.fields[23] );
			}
			return this.traj;
			
		case CricketField.BOWL_SPEED:
			return Number( this.fields[3] );
			
		case CricketField.HAS_HANDEDNESS:
			return this.fields[6].length > 0;
			
		case CricketField.HANDEDNESS:
			return this.fields[6] === 'y' ? CricketHandedness.RIGHT : CricketHandedness.LEFT;
			
		case CricketField.IS_COUNTING:
			var et = this.fields[19];
			return ( et.length === 0 || 'Lb' === et || 'B' === et );
			
		case CricketField.EXTRA_TYPE:
			return this.fields[19];
			
		case CricketField.DISMISSED:
			return this.fields[14];
			
		case CricketField.NF_BATSMAN:
			return this.fields[1];
			
		case CricketField.WIN_LIKELIHOODS:
			if ( Utils.isNullish( this.fields[20] ) )
			{
				return undefined;
			}
			else
			{
				return [ +this.fields[20], +this.fields[21], +this.fields[22] ];
			}
			
		case CricketField.BOWLER_SPEED:
			return this.bowlerSpeed;
			
		case CricketField.PITCH_SEGMENT:
			return this.fields[13];
		
		case CricketField.MOD:
			return this.fields[15];
	}
};

/**
 * Returns true if the traj field is non-nullish.
 */
PULSE.UdsHawkeyeRecord.prototype.hasTrajData = function ()
{
	return !Utils.isNullish( this.fields[23] );
};

/**
 * Gets a runs/wicket summary for this record.
 */
PULSE.UdsHawkeyeRecord.prototype.generateSummary = function ( lowercase )
{
	var summary = '';
	if ( this.get( CricketField.IS_WICKET ) )
	{
		summary += lowercase ? 'wicket ' : 'Wicket ';
	}
	
	var runs = +this.get( CricketField.RUNS );
	if ( runs > 0 )
	{
		summary += runs + ' run';
		if ( runs > 1 )
		{
			summary += 's';
		}
		
		var et = this.get( CricketField.EXTRA_TYPE );
		if ( et.length > 0 )
		{
			summary += ' (' + ( lowercase ? et.toLowerCase() : et ) + ')';
		}
	}
	return summary;
}

/**
 * Obtains a commentary-style description of this record.
 */
PULSE.UdsHawkeyeRecord.prototype.generateDescription = function ()
{
	var description = '<b>';

	description += ( +this.get( CricketField.OVER ) - 1 );
	description += '.';
	description += this.get( CricketField.COUNTING_BALL );
	description += '</b> ';
	
    description += this.get( CricketField.BOWLER );
    description += ' to ';
    description += this.get( CricketField.BATSMAN );

    // Add ball speed to description
    var speed = this.get( CricketField.BOWL_SPEED );
    if ( !isNaN( speed ) && speed >= 30 && speed <= 120 )
    {
        description += ', ';
        if ( PULSE.SpeedModeController.mode === PULSE.SpeedModeController.MODE_KMH )
        {
        	speed = PULSE.SpeedModeController.mphToKmh( speed );
        }
        
        description += speed.toFixed( 1 );
        description += ' ' + PULSE.SpeedModeController.unit;        
    }

    // Add runs scored to description
	var credit = +this.get( CricketField.CREDIT );
    
    description += ', ';
    if ( this.get( CricketField.IS_WICKET ) )
    {
        description += 'wicket';
    }
    else 
    {
    	if ( credit === 0 )
	    {
	        description += 'dot ball';
	    }
	    else
	    {
	        description += credit;
	        description += ' run';
	        if ( credit > 1 )
	        {
	            description += 's';
	        }
	    }
    }

    // Add description of where the ball went
    var ps = this.get( CricketField.PITCH_SEGMENT );
    if ( !Utils.isNullish( ps ) && !this.get( CricketField.IS_WICKET ) && credit > 0 )
    {
    	description += ', hit ';
    	description += CricketSegmentLookup[ ps ];
    }

    // Finish the sentence
    description += '.';

    return description;
};

/**
 * Parses the trajectory data given.
 */
PULSE.UdsHawkeyeRecord.parseTrajectory = function ( encoded )
{
	// Raw string is a Base64 encoded stream
	var decoded = Base64Decoder.decode( encoded );
	
	if ( decoded.length < 72 )
	{
		PULSE.Tracer.warn( 'Decoded traj length was ' + decoded.length );
		return undefined;
	}
	
    // Extract coefficients into a trajectory object
	var traj = new CricketBallTrajectory();
	try
	{
		traj.bp   = PULSE.UdsHawkeyeRecord.readMulti( decoded, 0, 2 );
		traj.bt   = PULSE.UdsHawkeyeRecord.readMulti( decoded, 8, 1 ).x;
		traj.a 	  = PULSE.UdsHawkeyeRecord.readMulti( decoded, 12, 3 );
		traj.ebv  = PULSE.UdsHawkeyeRecord.readMulti( decoded, 24, 3 );
		traj.obv  = PULSE.UdsHawkeyeRecord.readMulti( decoded, 36, 3 );
		traj.oba  = PULSE.UdsHawkeyeRecord.readMulti( decoded, 48, 3 );
		traj.bh   = PULSE.UdsHawkeyeRecord.readMulti( decoded, 60, 1 ).x;
		//traj.pred = parseBoolean( decoded.substring( 64, 65 ) );
		//traj.xpos = this.readMulti( decoded, 65, 1 ).x;
		//traj.end = ?
		//traj.trackApproved = parseInt( decoded.substring( 71, 72 ) ) === 1;
		// TODO
		traj.trackApproved = true;

		// Calculate the period
	    var start = traj.getTimeAtX( 18.5 ) + traj.bt;
	    var end = traj.getTimeAtX( 0 ) + traj.bt;
	    traj.period = { start: start, end: end };
	}
	catch ( exception )
	{
		PULSE.Tracer.error( exception );
		traj.trackApproved = false;
	}
	
	return traj;
};

/**
 * Utility method to read multiple floats from the given data stream.
 */
PULSE.UdsHawkeyeRecord.readMulti = function ( data, offset, n )
{
	var ret = {};

	if ( n > 0 )
	{
		ret.x = PULSE.UdsHawkeyeRecord.decodeFloat( data.substring( offset, offset + 4 ) );
	}
	if ( n > 1 )
	{
		ret.y = PULSE.UdsHawkeyeRecord.decodeFloat( data.substring( offset + 4, offset + 8 ) );
	}
	if ( n > 2 )
	{
		ret.z = PULSE.UdsHawkeyeRecord.decodeFloat( data.substring( offset + 8, offset + 12 ) );
	}
	
	return ret;
};

/**
 * Decode an IEE754 float.
 */
PULSE.UdsHawkeyeRecord.decodeFloat = function ( data )
{
    var sign = ( data.charCodeAt( 0 ) & 0x80 ) >> 7;
    var exponent = ( ( data.charCodeAt( 0 ) & 0x7F ) << 1 ) + ( data.charCodeAt( 1 ) >> 7 );
    
    var significand = 0.0;
    var bit = 23;
    var component = 1.0;
    var b;
    var mask;

    while ( bit >= 0 )
    {
        if ( bit === 23 )
        {
            b = ( data.charCodeAt( 1 ) & 0x7F ) | 0x80;
            mask = 0x80; 
        }
        else if ( bit === 15 )
        {
            b = data.charCodeAt( 2 );
            mask = 0x80; 
        }
        else if ( bit === 7 )
        {
            b = data.charCodeAt( 3 );
            mask = 0x80; 
        }
	
	    if ( ( mask & b ) === mask )
	    {
	        significand += component;
	    }

	    component /= 2;
	    mask = mask >> 1;
	    bit--;
    }

    return Math.pow( -1, sign ) *
           Math.pow( 2, exponent - 127 ) *
           significand; 
};

if ( !PULSE ) { var PULSE = {}; }

/** A simple static class to control the speed mode in the client. */
PULSE.SpeedModeController = {
		
		// MPH to KMH convertion unit
		MPH_TO_KMH : 1.609,
		// M/S to Km/h
		MPS_TO_KMH : 3.6,
		
		// Available modes
		MODE_MPH : 'mph',
		MODE_KMH : 'kmh',
		
		MPH_UNIT : 'mph',
		KMH_UNIT : 'km/h',
		
		// Current mode and unit
		mode : 'mph',
		unit : 'mph',
		
		setMode : function( mode )
		{
			this.mode = mode;
			this.unit = mode === this.MODE_KMH ? this.KMH_UNIT : this.MPH_UNIT; 
		},
		
		// Converts miles per hour to kilometers per hour
		mphToKmh : function( mph )
		{
			return mph * this.MPH_TO_KMH; 
		},
		
		// Converts metres per sec to kilometers per hour
		mpsToKmh : function( mps )
		{
			return mps * this.MPS_TO_KMH; 
		}
};

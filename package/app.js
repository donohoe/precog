/* v0.2 */

var ಠ_ಠ = {

	csp:     null,
	domains: [],

	Keywords: [
		"maga", 
		"precogtest" /* TEST */
	],

	Users: {
		Index: [],
		Data:  {}
	},

	BlockOnPage: [], /* Subset of users we should block on the page */

	init: function() { 
		this.run();
		var self = this;

		document.addEventListener("click", function() {
			setTimeout(function(){
				self.findUsersInPage();
			}, 1199);
		});

		setInterval(function() {
			self.findUsersInPage();
		}, 3001);
	},

	run: function(){
		console.time("Precog");
		this.loadDataUsers();
		this.findUsersInPage();
		console.timeEnd("Precog");
		console.log("USERS:", this.Users );
	},

	loadDataUsers: function() {
		var users = localStorage.getItem( "precog_ext_users" ) || false;
		if (users) {
			this.Users = JSON.parse( users );
		}
	},

	saveDataUsers: function( self ) {
		
		console.log("saveDataUsers users", self.Users );
		var users = JSON.stringify( self.Users );
		console.log("saveDataUsers users", users );
		localStorage.setItem( "precog_ext_users", users );
	},

	findUsersInPage: function() {

		var userEls = document.querySelectorAll("a.js-user-profile-link");
		var l = userEls.length;
		for (var i=0; i<l; i++) {
			var userEl = userEls[i];
			var userId = userEl.getAttribute( "data-user-id" ) || false;
			var isScanned = userEl.getAttribute( "data-scanned" ) || false;
			if (!isScanned) {
				this.getUserData( userId );
				userEl.setAttribute( "data-scanned", "1" );
			}
		}

	},

	getUserData: function( userId ) {

		var userId = userId.toString();

		if (this.Users.Index.indexOf( userId ) > -1) {
			var user = this.Users.Data[ "u_" + userId ] || false;
			if (user) {
				if (user.block) {
					this.addBlockButton( user );
				}
			} else {
				console.log("User exists but could not find Data!");
			}

		} else {
			var self = this;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://twitter.com/i/profiles/popup?user_id=" + userId + "&wants_hovercard=true&_=" + new Date().getTime(), true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					self.addUserData( JSON.parse( xhr.responseText ) );
				}
			}
			xhr.send();
		}
	},

/*
	html: "<XYZ>",
	screen_name: "RealBillMcClure"
	user_id: "2510706061"
*/
	addUserData: function( data ) {

		var user_id = data.user_id;

		console.log("addUserData", user_id);

		if (this.Users.Index.indexOf( user_id ) === -1) {
			this.Users.Index.push( user_id );
		}

		var user = {
			id:     user_id,
			block:  false,
			handle: data.screen_name,
			bio:    this.getUserBio( data )
		};

		var shouldBlock = this.checkBlockTerms( user );
		if (shouldBlock) {
			user.block = true;
			user.why = shouldBlock || "";
			this.addBlockButton( user );
		}

		this.Users.Data[ "u_" + user_id.toString() ] = user;

		this.saveDataUsers( this ); /* SAVE */
	
		// console.log("this.Users", this.Users);
	},

	getUserBio: function( data ) {
		var bioText = "";
		var html = data.html || "";
		if (html) {
			var div = document.createElement( "DIV" );
			div.innerHTML = html;

			var bioEl = div.querySelector( "div.bio-container" ) || false;
			if (bioEl) {
				bioText = bioEl.innerText.trim();
			}
		}

		return bioText;
	},

	checkBlockTerms: function( user ) {
		var bio = user.bio.toLowerCase() || "";
		if (bio.length < 3) {
			return false;
		}
		var l = this.Keywords.length;
		for (var i=0; i<l; i++) {
		/* Check: startsWith, conatins with leading space, contains with leading hash */
			if (bio.indexOf( this.Keywords[i] ) === 0 || bio.indexOf( " " + this.Keywords[i] ) > 0 || bio.indexOf( "#" + this.Keywords[i] ) > 0) {
				return this.Keywords[i];
			}
		}
		return false;
	},

	addBlockButton: function( user ) {
		console.log("addBlockButton", user);

		var selector = "a.js-user-profile-link[data-user-id='" + user.id + "']";
		var userEl = document.querySelector( selector) || false;

		if (userEl) {

			var hasBlockButton = userEl.getAttribute( "hasBlockButton" ) || false;
			if (!hasBlockButton) {

				var div = document.createElement("DIV");
				div.className = 'block-link js-actionBlock';
				div.setAttribute( "role", "presentation" );
				div.setAttribute( "data-nav", "block" );

				if (user.why) {
					div.setAttribute( "title", "Keywords: " + user.why );
				}

				var s = [
					'font-size: 12px;',
					'line-height: 12px;',
					'padding: 4px 14px;',
					'margin-top: 0px;',
					'margin-right: 2px;',
				].join('');

				div.innerHTML = [
					'<button type="button" class="dropdown-link EdgeButton EdgeButton--danger block-button" role="menuitem" style="' + s + '">',
						'Block <span class="username u-dir u-textTruncate" dir="ltr">@',
						'<b>' + user.handle + '</b>',
					'</span></button>'
				].join('');

				userEl.parentNode.insertBefore(div, userEl.nextSibling);
				userEl.setAttribute( "hasBlockButton", "1");
			}

		}

	},

};

ಠ_ಠ.init();

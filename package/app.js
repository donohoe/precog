/* v0.1 */

var ಠ_ಠ = {

	csp:     null,
	domains: [],

	Keywords: [
		"maga", "irritated", "hypocrisy"
	],

	Users: {
		Index: [],
		Data:  []
	},

	BlockOnPage: [], /* Subset of users we should block on the page */

	init: function() { 
		this.run();
		
		var self = this;
		document.addEventListener("click", function(){
			setTimeout(function(){
				self.run();
			}, 999);
		});
	},

	run: function(){
		console.time("Precog");
		this.loadData();
		this.findUsersInPage();
		console.timeEnd("Precog");
		console.log("USERS:", this.Users );
	},

	loadData: function() {
		var keywords = localStorage.getItem( "precog_ext_keywords" ) || false;
		if (keywords) {
			this.Keywords = JSON.parse( keywords );
		}
	},

	saveData: function( self ) {
		var kws   = JSON.stringify( self.Keywords );
		localStorage.setItem( "precog_ext_keywords", kws );
	},

	findUsersInPage: function() {

		var userEls = document.querySelectorAll("a.js-user-profile-link");
		var l = userEls.length;
		for (var i=0; i<l; i++) {
			var userEl = userEls[i];
			var userId = userEl.getAttribute( "data-user-id" ) || false;
			this.getUserData( userId );
		}

	},

	getUserData: function( id ) {

		var id = id.toString(); // "" + id;

		if (this.Users.Index.indexOf( id ) > -1) {
			// User does exist
			// console.log("User exists: ", this.Users.Data[ id ] );
			return;
		}

		var self = this;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://twitter.com/i/profiles/popup?user_id=" + id + "&wants_hovercard=true&_=" + new Date().getTime(), true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				self.addUserData( JSON.parse( xhr.responseText ) );
			}
		}
		xhr.send();
	},

/*
	html: "<XYZ>",
	screen_name: "RealBillMcClure"
	user_id: "2510706061"
*/
	addUserData: function( data ) {

		var user_id = data.user_id;
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

		this.Users.Data[ user_id ] = user;

		this.saveData( this ); /* SAVE */
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
			if (bio.indexOf( this.Keywords[i] ) > -1) {
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

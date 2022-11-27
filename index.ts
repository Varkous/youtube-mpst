"use strict";



const main = document.querySelector('main');

let embedVideo: any = CheckElement(document.getElementById("embed-video")).checked;
let file: HTMLElement | null = document.getElementById('file');
let querying = 0;
let id: any = null;

type List = {
  elements: HTMLElement | null, 
  data: {} | any;
}

function CheckElement(element: HTMLElement | null): any {
  if (element) return element;
  else throw Error("Element does not exist. Reload page");
}


window.onload = gapi.client.setApiKey('AIzaSyCI6kajNUTHjsx1Z2xYSPj9A4RNdUd4r_0');


class PlaylistController {
  current: {
    title: [string, HTMLElement | null], 
    list: List,
    register: (evt: any) => void,
    clear: () => void,
  }
  original: {
    list: List,
    clear: () => void,
    load: (evt: Event) => void,
  }
  all: HTMLElement | null
  // ----------------------------------------------
  constructor() {
    this.current = {
      title: ['', document.getElementById('playlist-title')],
      // ===============
      list: {elements: document.getElementById('current-list'), data: {}},
      // ===============
      register: (evt: any): void => {
        
        // -----------------------------------   
        if (Object.keys(this.current.list.data).length === 0) 
          FormMsg("No playlist to register", "message3", "brown");
          

        let filename: string = `${this.current.title[0]}.json`;
        let contentType: string = "application/json;charset=utf-8;";

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(this.current.list.data)))], { type: contentType });
          navigator.msSaveOrOpenBlob(blob, filename);
        } else {
          let a = document.createElement('a');
          a.download = filename;
          a.href = `data:${contentType},` + encodeURIComponent(JSON.stringify(this.current.list.data));
          a.click();
          a.remove();
        }
        return;
      },
      // ===============
      clear: (): void => {
        this.current.title[0] = '';
        this.current.list.data = {};

        if (this.current.title[1]) //Typescript
          this.current.title[1].innerText = '';

        if (this.current.list.elements) //Typescript
          this.current.list.elements.innerHTML = '';
      }
    };

   // ==================-------=================

    this.original = {
      list: {elements: document.getElementById('original-list'), data: {}},
      // ===============
      clear: () => {
        if (this.original.list.elements)
        this.original.list.elements.innerHTML = ''; 
        this.original.list.data = {}; 
        CheckElement(file).value = '';
      },
      // ===============
      load: (evt): void => {
        let reader: any = new FileReader();
        let file = document.getElementById("file");
      
        let importedFile = CheckElement(file).files[0];
        if (reader) {
        reader.onload = () => {
          this.original.list.data = JSON.parse(reader.result);
          for (let entry in this.original.list.data) {
            let song = this.original.list.data[entry];
            let bordercolor = song.title === "Deleted video" || song.title === "Private video" ? 'orange' : 'gray';
      
            CheckElement(this.original.list.elements).innerHTML += `
            <li style="display: list-item; height: auto; border-color: ${bordercolor}" id="${song.id}">${song.title}
              <span style="color: grey; float:right">${song.uploader}</span>
            </li>`
          }
        }; 
        reader.readAsText(importedFile); 
        this.original.clear();
      }
      },  
    };

    // ==================-------=================
    this.all = document.getElementById('playlists');
  }
// -----------------------------------   
  get(evt: Event): void {

    evt.preventDefault();
    let username: HTMLElement | null = CheckElement(document.getElementById('username')).value;

    gapi.client.load('youtube', 'v3', async () => {
      FormMsg("Waiting on YouTube...", 'message1', 'lightblue');

      let channel = await gapi.client.youtube.channels.list({
        part: 'id',
        forUsername: username,
      });

      if (!channel.result.items) return FormMsg("Username invalid", 'message1', 'red');

        const entries = await gapi.client.youtube.playlists.list({
          part: 'snippet',
          channelId: channel.result.items[0].id,
          maxResults: 500,
        });

        const playlistEntries = entries.result.items.map(MakePlayListing).join(' ');
    
        CheckElement(this.all).innerHTML = playlistEntries;
        FormMsg("Done", 'message1', 'lightblue');
      });
  }
  // -----------------------------------   
  remove_listing(listing: HTMLLIElement | null) {
    CheckElement(listing).parentNode.removeChild(listing);
  }
  // -----------------------------------
  query_songs(api_key: string, playlist_id: string, entries: number, page_token: number) {
    
    if (this.current.title[0] !== CheckElement(document.getElementById(playlist_id)).innerText)  {
      CheckElement(this.current.list.elements).innerHTML = '';
      this.current.title[0] = CheckElement(document.getElementById(playlist_id)).innerText;
    }

    gapi.client.setApiKey(api_key);
    gapi.client.load('youtube', 'v3', async () => {
      // ================
      await gapi.client.youtube.playlistItems.list({
        part: 'snippet',
        playlistId: playlist_id,
        channelId: id,
        pageToken: page_token ? page_token : '',
        maxResults: entries
      }).then( (songs: any) => {

        songs = songs.result;
        // ================
        for (let item of songs.items) {
          let details = item.snippet;
          this.current.list.data[details.resourceId.videoId] = {title: details.title, uploader: details.videoOwnerChannelTitle, id: details.resourceId.videoId};     

          let entry = `
          <li>
            <a href="https://www.youtube.com/watch?v=${details.resourceId.videoId}">${details.title}</a>
            <span style="float:right">${details.videoOwnerChannelTitle}</span>
          </li>`;
          if (embedVideo) entry += `<iframe width="320" height="215"
          src="https://www.youtube.com/embed/${details.resourceId.videoId}">
          </iframe>`;

          CheckElement(this.current.list.elements).innerHTML += entry;
        }
        // ================
        if (songs.nextPageToken) return this.query_songs(api_key, playlist_id, entries, songs.nextPageToken) 
        else return CheckElement(this.current.title[1]).innerText = this.current.title[0]+ ` (${songs.pageInfo.totalResults})`;
      });
    });
  };
  // ----------------------------------- 
  compare() {
    let curr: any = this.current.list.data; //Current Playlist
    let orig: any = this.original.list.data; // Original Playlist

    document.querySelectorAll('i').forEach( e => e.remove());
    if (curr === orig || Object.keys(curr).length === 0) return FormMsg("No playlist to compare to", "message2", "brown");
    
    for (const origsong in orig) {
      let missingSong: HTMLElement | any = document.getElementById(orig[origsong].id)

      let found = Object.values(curr).find( (currsong: any) => {
        currsong.title == orig[origsong].title && currsong.id == orig[origsong].id
      });
      
      if (!found && missingSong) {
        orig[origsong].missing = true;
        missingSong.classList.add('missing');
        missingSong.innerHTML += `<i style="color: red" class="missing">Missing</i>`;
      } else missingSong.classList.remove('missing');
    }
  }
}; // -----------------------------------> End of Class




const Playlists: PlaylistController = new PlaylistController();
// -----------------------------------
function FormMsg(msg: string, element: string, color: string): void {
  let field: HTMLElement | null = document.getElementById(element);
  if (field) {
    field.style.color = color;
    field.innerText = msg;
    setTimeout( () => {
      field.innerText = '';
    }, 7000);
  }
}
// -----------------------------------
function MakePlayListing(item: any) {

  return item = `<li class="play-listing">
    <a href="https://youtube.com/playlist?list=${item.id}" title="${item.snippet.description}">
      <img src="${item.snippet.thumbnails.default.url}" style="margin-right: 8px;">
      <span id="${item.id}" style="color: skyblue; font-family: Helvetica;">${item.snippet.title}</span>
    </a>
    <div class="playlist-inputs" hidden>
      <button class="add-song" onclick="Playlists.current.clear(); Playlists.query_songs('AIzaSyCI6kajNUTHjsx1Z2xYSPj9A4RNdUd4r_0', '${item.id}', 50)">Query Songs</button>
      <button class="remove" onclick="Playlists.remove_listing(this.parentNode.parentNode)"><img src="/images/trash-small.svg"></button>
    </div>  
  </li>`
}  


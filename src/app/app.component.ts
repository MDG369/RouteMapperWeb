import {Component, OnChanges, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {User} from "./models/user.model";
import {UserService} from "./services/user.service";
import {Map as LeafletMap} from "leaflet";
import {MapOptions, tileLayer, latLng, Marker, MarkerOptions, Polyline} from "leaflet";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private userService: UserService) {

  }

  prevUserSize = 0;
  // @ts-ignore
  mapOptions: MapOptions;
  // @ts-ignore
  map: LeafletMap;
  title = 'AngularOSM';
  users: User[] = [];
  headingsDrawnPerUser = new Map<number, number>();
  polylines: Polyline[] = [];
  marker: Marker | undefined;

  ngOnInit(): void {
    this.initializeMapOptions();

    this.userService.fetchUsers().subscribe(
      (data) => {
        // Handle the response data here

        if (data.length != this.prevUserSize) {
          data.slice(this.prevUserSize).forEach((user: User) => this.headingsDrawnPerUser.set(user.userId, 0)
          )
          this.marker = this.createMarker(data[this.prevUserSize].lat, data[this.prevUserSize].long); // Coordinates for the marker
          this.marker.addTo(this.map)
          var length =  this.polylines.push(this.createPolyline(data[this.prevUserSize].lat, data[this.prevUserSize].long));

          this.polylines[length-1].addTo(this.map);
          this.prevUserSize++;
        }
        data.forEach((user: User) => {
          var correspondingUser = this.users.find(prevUser => prevUser.userId == user.userId);
          if (correspondingUser != undefined) {

            console.log(`${user.headingArray.length}, ${correspondingUser.headingArray.length}`)
            if (true) {
              for (let i = correspondingUser.headingArray.length; i < user.headingArray.length; i++) {
                const lastLatLongs = this.polylines[user.userId].getLatLngs();
                // @ts-ignore
                const lastLat = lastLatLongs[lastLatLongs.length - 1].lat;
                // @ts-ignore
                const lastLong = lastLatLongs[lastLatLongs.length - 1].lng;
                let coords = this.addDistanceToCoordinates(lastLat, lastLong, user.headingArray[i], 0.5);

                this.addToPolyline(this.polylines[user.userId], coords.latitude, coords.longitude, user.userId)
              }
            }
          }
        })
        this.users = data;

      },
      (error) => {
        // Handle errors
        console.error('Error fetching data:', error);
      }
    );
  }

  private initializeMapOptions() {
    this.mapOptions = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 25,
          attribution: 'Map data © OpenStreetMap contributors'

        })
      ],
      zoom: 18,
      center: new L.LatLng(54.371651, 18.612552)
    };
  }

  onMapReady(map: LeafletMap) {
    this.map = map;
  }


  private createMarker(latitude: number, longitude: number): Marker {
    const markerOptions: MarkerOptions = {};
    return new Marker(latLng(latitude, longitude));
  }

  private createPolyline(startLat: number, startLong: number): Polyline {
    const latLngs = [
      latLng(startLat, startLong),
    ];
    return new Polyline(latLngs, {color: 'red'});
  }

  private addToPolyline(polyline: Polyline, lat: number, long: number, userId: number) {
    let foundUser: User | undefined;
    let foundNumber: number = 0;
    // Update the number associated with the found user
    this.headingsDrawnPerUser.set(userId, foundNumber + 1 );
    polyline.addLatLng([lat, long])
  }

  private addDistanceToCoordinates(latitude: number, longitude: number, headingRadians: number, distanceMeters: number): {
    latitude: number,
    longitude: number
  } {
    // Earth's radius in meters
    const earthRadius = 6378137; // Approximate value for WGS84 ellipsoid

    // Convert heading to Cartesian coordinates
    const dx = Math.cos(headingRadians) * distanceMeters;
    const dy = Math.sin(headingRadians) * distanceMeters;

    // Convert offset in meters to offset in degrees (longitude and latitude)
    const deltaLongitude = dx / (earthRadius * Math.cos(latitude * Math.PI / 180)) * (180 / Math.PI);
    const deltaLatitude = dy / earthRadius * (180 / Math.PI);

    // Calculate final coordinates
    const newLatitude = latitude + deltaLatitude;
    const newLongitude = longitude + deltaLongitude;

    return {latitude: newLatitude, longitude: newLongitude};
  }

  private returnLatLongDelta(headingRadians: number, distanceMeters: number) {
    const earthRadius = 6378137; // Approximate value for WGS84 ellipsoid

    // Convert heading to Cartesian coordinates
    const dx = Math.cos(headingRadians) * distanceMeters;
    const dy = Math.sin(headingRadians) * distanceMeters;

    // Convert offset in meters to offset in degrees (longitude and latitude)
    const deltaLongitude = dx / (earthRadius * Math.cos(54.3 * Math.PI / 180)) * (180 / Math.PI);
    const deltaLatitude = dy / earthRadius * (180 / Math.PI);

    return {latitude: deltaLatitude, longitude: deltaLongitude};
  }

}



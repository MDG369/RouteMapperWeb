import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {
  icon,
  latLng,
  Map as LeafletMap,
  MapOptions,
  Marker,
  Polyline,
} from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

import {User} from "./models/user.model";
import {UserService} from "./services/user.service";

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
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    Marker.prototype.options.icon = iconDefault;

    this.initializeMapOptions();

    this.userService.fetchUsers().subscribe(
      (data) => {
        if (data.length != this.prevUserSize) {
          this.handleNewUser(data);
        }
        data.forEach((user: User) => {
          this.drawPolylineForEachUser(user);
        })
        this.users = data;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private drawPolylineForEachUser(user: User) {
    const correspondingUser = this.users.find(prevUser => prevUser.userId == user.userId);
    if (correspondingUser != undefined) {
      console.log(this.users)
      // Get the number of previously drawn polylines and the number of all points
      for (let i = this.headingsDrawnPerUser.get(user.userId)!; i < user.headingArray.length; i++) {
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

  private handleNewUser(data: User[]) {
    data.slice(this.prevUserSize).forEach((user: User) => this.headingsDrawnPerUser.set(user.userId, 0))
    this.marker = this.createMarker(data[this.prevUserSize].lat, data[this.prevUserSize].long); // Coordinates for the marker
    this.marker.addTo(this.map)
    const length = this.polylines.push(this.createPolyline(data[this.prevUserSize].lat, data[this.prevUserSize].long));
    this.polylines[length - 1].addTo(this.map);
    this.prevUserSize++;
  }

  private initializeMapOptions() {
    this.mapOptions = {
      zoom: 21,
      center: new L.LatLng(54.371651, 18.612552)
    };
  }

  onMapReady(map: LeafletMap) {
    this.map = map;
    L.gridLayer.googleMutant({
      type: "roadmap",
    })
      .addTo(this.map);
  }


  private createMarker(latitude: number, longitude: number): Marker {
    this.map.flyTo([latitude, longitude], 21);
    return new Marker(latLng(latitude, longitude));
  }

  private createPolyline(startLat: number, startLong: number): Polyline {
    const latLngs = [
      latLng(startLat, startLong),
    ];
    return new Polyline(latLngs, {color: 'red'});
  }

  private addToPolyline(polyline: Polyline, lat: number, long: number, userId: number) {
    let foundNumber: number | undefined;
    foundNumber = this.headingsDrawnPerUser.get(userId);
    // Update the number associated with the found user
    this.headingsDrawnPerUser.set(userId, foundNumber ? foundNumber + 1 : 1);
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

    const newLatitude = latitude + deltaLatitude;
    const newLongitude = longitude + deltaLongitude;

    return {latitude: newLatitude, longitude: newLongitude};
  }
}



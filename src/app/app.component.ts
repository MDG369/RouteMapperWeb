import {Component, OnInit} from '@angular/core';
import L from 'leaflet';
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
import GeoRasterLayer, {GeoRaster} from "georaster-layer-for-leaflet";
import 'leaflet-easybutton'
import parseGeoRaster from 'georaster';
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
  markers = new Map<number, Marker>
  polylines = new Map<number, Polyline>
  marker: Marker | undefined;
  indoorOverlayLayer

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
        if (data.length > this.prevUserSize) {
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
      // Get the number of previously drawn polylines and the number of all points
      for (let i = this.headingsDrawnPerUser.get(user.userId)!; i < user.headingArray.length; i++) {
        const lastLatLongs = this.polylines.get(user.userId)!.getLatLngs();
        // @ts-ignore
        const lastLat = lastLatLongs[lastLatLongs.length - 1].lat;
        // @ts-ignore
        const lastLong = lastLatLongs[lastLatLongs.length - 1].lng;
        let coords = this.addDistanceToCoordinates(lastLat, lastLong, user.headingArray[i], 0.5);

        this.addToPolyline(this.polylines.get(user.userId)!, coords.latitude, coords.longitude, user.userId)
      }
    }
  }

  private handleNewUser(data: User[]) {
    data.slice(this.prevUserSize).forEach((user: User) => this.headingsDrawnPerUser.set(user.userId, 0))
    this.marker = this.createMarker(data[this.prevUserSize].lat, data[this.prevUserSize].long); // Coordinates for the marker
    this.marker.addTo(this.map)
    this.markers.set(data[this.prevUserSize].userId, this.marker)
    const polyline = this.createPolyline(data[this.prevUserSize].lat, data[this.prevUserSize].long)
    this.polylines.set(data[this.prevUserSize].userId, polyline)
    polyline.addTo(this.map);
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


    const add_geotiff = async () => {

      const url = "assets/c_first_floor_GPNT_4326_2.tif";
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(parseGeoRaster)
        // @ts-ignore
        .then((georaster: GeoRaster) => {
          const imageryLayer = new GeoRasterLayer({
            georaster,

            resolution: 256,

            opacity: 1
          });

          imageryLayer.addTo(this.map).bringToFront();
          this.map.fitBounds(imageryLayer.getBounds());
          this.indoorOverlayLayer = imageryLayer;
          return imageryLayer
        })
        .then((imageryLayer) => {
            var stateChangingButton = L.easyButton({
              id: 'but',
              states: [{
                stateName: 'indoor-visible',
                icon: 'bi bi-door-closed-fill',
                title: 'Hide indoors layer',
                onClick: function (btn, map) {
                  map.removeLayer(imageryLayer);
                  btn.state('indoor-hidden');
                }
              }, {
                stateName: 'indoor-hidden',
                icon: 'bi bi-door-closed',
                title: 'Show indoors layer',
                onClick: function (btn, map) {
                  map.addLayer(imageryLayer);
                  btn.state('indoor-visible');
                }
              }]
            })
            stateChangingButton.addTo(this.map);
          }
        )
      L.gridLayer.googleMutant({
        type: "roadmap",
      })
        .addTo(this.map);
    }
    add_geotiff();


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

  private addDistanceToCoordinates(lat1: number, lon1: number, bearing: number, distance: number): {
    latitude: number,
    longitude: number
  } {
    // Earth's radius in meters
    const R = 6378137; // Approximate value for WGS84 ellipsoid

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = lat1 * Math.PI / 180;
    const lon1Rad = lon1 * Math.PI / 180;

    // Calculate the new latitude
    const lat2Rad = Math.asin(
      Math.sin(lat1Rad) * Math.cos(distance / R) +
      Math.cos(lat1Rad) * Math.sin(distance / R) * Math.cos(bearing)
    );

    // Calculate the new longitude
    const lon2Rad = lon1Rad + Math.atan2(
      Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat1Rad),
      Math.cos(distance / R) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
    );
    // Convert the latitude and longitude from radians to degrees
    const lat2 = lat2Rad * 180 / Math.PI;
    const lon2 = lon2Rad * 180 / Math.PI;

    return {latitude: lat2, longitude: lon2};
  }

  removeUser(user) {
    this.userService.deleteUser(user.userId).subscribe(res => {
      this.headingsDrawnPerUser.delete(user.userId)
      this.map.removeLayer(this.markers.get(user.userId)!)
      this.map.removeLayer(this.polylines.get(user.userId)!)
      this.polylines.delete(user.userId)
      this.users = res;
      this.prevUserSize = res.length
    });
  }
}


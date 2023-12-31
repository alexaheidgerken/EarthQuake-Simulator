/* Assignment 3: Earthquake Visualization
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { EarthquakeMarker } from './EarthquakeMarker';
import { EarthquakeRecord } from './EarthquakeRecord';

export class Earth extends gfx.Transform3
{
    private earthMesh: gfx.MorphMesh;

    public globeMode: boolean;

    constructor()
    {
        // Call the superclass constructor
        super();

        this.earthMesh = new gfx.MorphMesh();

        this.globeMode = false;
    }

    public createMesh() : void
    {
        // Initialize texture: you can change to a lower-res texture here if needed
        // Note that this won't display properly until you assign texture coordinates to the mesh
        this.earthMesh.material.texture = new gfx.Texture('./assets/earth-2k.png');
        
        // This disables mipmapping, which makes the texture appear sharper
        this.earthMesh.material.texture.setMinFilter(true, false);   

        // You can use this variable to define the resolution of your flat map and globe map
        // using a nested loop. 20x20 is reasonable for a good looking sphere, and you don't
        // need to change this constant to complete the base assignment  However,if you want 
        // to use height map or bathymetry data for a wizard bonus, you might need to increase
        // the mesh resolution to get better results.
        const meshResolution = 20;
        
        // Precalculated vertices and normals for the earth plane mesh.
        // After we compute them, we can store them directly in the earthMesh,
        // so they don't need to be member variables.
        const mapVertices: gfx.Vector3[] = [];
        const mapNormals: gfx.Vector3[] = [];

        // Part 1: Creating the Flat Map Mesh
        // As a demo, we'll add an rectangle with two triangles.
        // First, we define four vertices at each corner of the earth
        // in latitude and longitude and convert to the coordinates
        // used for the flat map.
        //mapVertices.push(this.convertLatLongToPlane(-Math.PI/2, -Math.PI));
        //mapVertices.push(this.convertLatLongToPlane(-Math.PI/2, Math.PI));
        //mapVertices.push(this.convertLatLongToPlane(Math.PI/2, Math.PI));
        //mapVertices.push(this.convertLatLongToPlane(Math.PI/2, -Math.PI));
        //cellwidth / meshresolution
        const width = (180) / meshResolution;
        const height = (360) / meshResolution;
        //for(let i=-Math.PI; i < Math.PI; i+=height){
        //    for(let j=-Math.PI/2; j < Math.PI/2; j+=width){
         //       mapVertices.push(this.convertLatLongToPlane(j, i));
                //console.log(j, "\n", i);
                

          //  }
        //}
        const longi = -(90);
        const lati = -180;
        for(let i=0; i <= (meshResolution); i++){
            for(let j=0; j <= (meshResolution); j++){
                const newlat = lati + height * j;
                const newlong = longi + width * i;
                mapVertices.push(this.convertLatLongToPlane(newlong, newlat));
                mapNormals.push(gfx.Vector3.BACK);
                //mapNormals.push(new gfx.Vector3(newlat, 0, newlong));
                //mapVertices.push(this.convertLatLongToPlane((longi + (width * j)), (lati + (height * i))));
            }
        }

        // The flat map normals are always directly outward towards the camera
        //mapNormals.push(gfx.Vector3.BACK);
        //mapNormals.push(gfx.Vector3.BACK);
        //mapNormals.push(gfx.Vector3.BACK);
        //mapNormals.push(gfx.Vector3.BACK);
        //for(let i=0; i < meshResolution-1; i++){
            //mapNormals.push(gfx.Vector3.BACK);
        //

        // Define indices into the array for the two triangles
        const indicis : number[] = [];
        for(let i=0; i < meshResolution; i++){
            for(let j=0; j < meshResolution; j++){
                const upperL = (meshResolution+1) * i + j;
                const upperR = upperL + 1;
                const lowerL = upperL + meshResolution+1;
                const lowerR = lowerL + 1;
                indicis.push(upperL, upperR, lowerL);
                indicis.push(lowerL, upperR, lowerR);
            }

        }
        //const indices: number[] = [];
        //indices.push(0, 1, 2);
        //indices.push(0, 2, 3);

        // Part 2: Texturing the Mesh
        // Again, you should replace the example code below
        // with texture coordinates for the earth mesh.
        //const texCoords: number[] = [];
        //texCoords.push(0, 0);
        //texCoords.push(0, 0);
        //texCoords.push(0, 0);
        //texCoords.push(0, 0);
        //00, 11
        const texCoords: number[] = [];
        for(let i=0; i<=meshResolution; i++){
            for(let j=0; j<=meshResolution; j++){
                const x = 1 - i / meshResolution;
                const y = j / meshResolution;
                texCoords.push(y, x);
            }
        }



        // Set all the earth mesh data
        this.earthMesh.setVertices(mapVertices, true);
        this.earthMesh.setNormals(mapNormals, true);
        this.earthMesh.setIndices(indicis);
        this.earthMesh.setTextureCoordinates(texCoords);
        this.earthMesh.createDefaultVertexColors();

        // Part 3: Creating the Globe Mesh
        // You should compute a new set of vertices and normals
        // for the globe. You will need to also add code in
        // the convertLatLongToSphere() method below.
        const morphVertices: gfx.Vector3[] = [];
        const morphNormals: gfx.Vector3[] = [];
        // Add the mesh to this group
        const longo = -90;
        const lato = -180;
        
        for(let i=0; i <= (meshResolution); i++){
            for(let j=0; j <= (meshResolution); j++){
                const angle1 = height * j;
                const angle2 = width * i;
                const newlat = lati + height * j;
                const newlong = longi + width * i;
                morphVertices.push(this.convertLatLongToSphere(newlong, newlat));

                morphNormals.push(gfx.Vector3.normalize(this.convertLatLongToSphere(newlong, newlat)));
            }
        }
        this.earthMesh.setMorphTargetVertices(morphVertices);
        this.earthMesh.setMorphTargetNormals(morphNormals);


        this.add(this.earthMesh);
    }

    public update(deltaTime: number) : void
    {
        // Part 4: Morphing Between the Map and Globe
        // The value of this.globeMode will be changed whenever
        // the user selects flat map or globe mode in the GUI.
        // You should use this boolean to control the morphing
        // of the earth mesh, as described in the readme.
        if(this.globeMode == true){
            this.earthMesh.morphAlpha = this.earthMesh.morphAlpha + 0.5 * deltaTime;
            if(this.earthMesh.morphAlpha > 1){
                this.earthMesh.morphAlpha = 1;
            }
        }
        else{
            this.earthMesh.morphAlpha = this.earthMesh.morphAlpha - 0.5 * deltaTime;
            if(this.earthMesh.morphAlpha < 0){
                this.earthMesh.morphAlpha = 0;
            }
            
        }
        
    }

    public createEarthquake(record: EarthquakeRecord)
    {
        // Number of milliseconds in 1 year (approx.)
        const duration = 12 * 28 * 24 * 60 * 60;

        // Part 5: Creating the Earthquake Markers
        // Currently, the earthquake is just placed randomly
        // on the plane. You will need to update this code to
        // correctly calculate both the map and globe positions.
        const mapPosition = this.convertLatLongToPlane(record.latitude, record.longitude);
        const globePosition = this.convertLatLongToSphere(record.latitude, record.longitude);

        const earthquake = new EarthquakeMarker(mapPosition, globePosition, record, duration);

        // Global adjustment to reduce the size. You should probably
        // update this be a more meaningful representation..
        earthquake.scale.set(0.25, 0.25, 0.25);
        if(record.magnitude >= 7.7){
            earthquake.scale.set(0.5,0.5,0.5);
            earthquake.material.setColor(gfx.Color.PURPLE);
        }

        // Uncomment this line of code to active the earthquake markers
        this.add(earthquake);
    }

    public animateEarthquakes(currentTime : number)
    {
        // This code removes earthquake markers after their life has expired
        this.children.forEach((quake: gfx.Transform3) => {
            if(quake instanceof EarthquakeMarker)
            {
                const playbackLife = (quake as EarthquakeMarker).getPlaybackLife(currentTime);

                // The earthquake has exceeded its lifespan and should be moved from the scene
                if(playbackLife >= 1)
                {
                    quake.remove();
                }
                // The earthquake positions should be updated
                else
                {
                    // Part 6: Morphing the Earthquake Positions
                    // If you have correctly computed the flat map and globe positions
                    // for each earthquake marker in part 5, then you can simply lerp
                    // between them using the same alpha as the earth mesh.
                    quake.position.lerp(quake.mapPosition, quake.globePosition, this.earthMesh.morphAlpha);
                }
            }
        });
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the flat map coordinate system described in the readme.
    public convertLatLongToPlane(latitude: number, longitude: number): gfx.Vector3
    {
        return new gfx.Vector3(longitude * Math.PI / 180, latitude * Math.PI / 180, 0);
    }

    // This convenience method converts from latitude and longitude (in degrees) to a Vector3 object
    // in the globe mesh map coordinate system described in the readme.
    public convertLatLongToSphere(latitude: number, longitude: number): gfx.Vector3
    {
        // Part 3: Creating the Globe Mesh
        // Add code here to correctly compute the 3D sphere position
        // based on latitude and longitude.
        const lata = latitude * (Math.PI / 180);
        const lona = longitude * (Math.PI / 180);
        const x = (Math.cos(lata) * Math.sin(lona));
        const y = (Math.sin(lata));
        const z = (Math.cos(lata) * Math.cos(lona));

        return new gfx.Vector3(x,y,z);
    }

    // This function toggles the wireframe debug mode on and off
    public toggleDebugMode(debugMode : boolean)
    {
        this.earthMesh.material.wireframe = debugMode;
    }
}
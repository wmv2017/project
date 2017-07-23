#!/usr/bin/env python

import cv2
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import re
# Read Image

def project_to_slip(validate_points,size):


    #2D image points. If you change the image, you need to change vector
    image_points = np.array([
                                (72, 243),     # Nose tip
                                (157, 283),     # Chin
                                (388, 258),     # Left eye left corner
                                (157, 183),     # Right eye right corne
                                (380, 146),     # Left Mouth corner
                            ], dtype="double")

    # 3D model points.
    model_points = np.array([
                                (0.0, 1768.0, 0.0),             # Nose tip
                                (152.5, 1890.0, 0.0),        # Chin
                                (305.0, 1768.0, 0.0),     # Left eye left corner
                                (152.5, 1890.0, 71.0),      # Right eye right corne
                                (0.0, 0.0, 0.0),    # Left Mouth corner

                            ])
    # Camera internals
    # size = (354, 630, 3)
    focal_length = size[1]
    center = (size[1]/2, size[0]/2)
    camera_matrix = np.array(
                             [[focal_length, 0, center[0]],
                             [0, focal_length, center[1]],
                             [0, 0, 1]], dtype = "double"
                             )

    # print ("Camera Matrix :\n {0}".format(camera_matrix))

    dist_coeffs = np.zeros((4,1)) # Assuming no lens distortion
    (success, rotation_vector, translation_vector) = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)

    # print ("Rotation Vector:\n {0}".format(rotation_vector))
    # print ("Translation Vector:\n {0}".format(translation_vector))


    # Project a 3D point (0, 0, 1000.0) onto the image plane.
    # We use this to draw a line sticking out of the nose


    (img_pts, jacobian) = cv2.projectPoints(model_points, rotation_vector, translation_vector, camera_matrix, dist_coeffs)
    '''
    translate and display image
    '''
    (translate_pts, jacobian) = cv2.projectPoints(validate_points, rotation_vector, translation_vector, camera_matrix, dist_coeffs)
    return translate_pts #3d 121 1 2

def show_project_slip(translate_pts,color,im):
    for p in translate_pts:
        cv2.circle(im, (int(p[0][0]), int(p[0][1])), 3, color, -1)



'''
show the ordinary slip
'''
def show_ord_slip(slip_view,color,im):

    #the format of color should be (0,255,0)


    former_x = slip_view[0][0]
    former_y = slip_view[0][1]
    for i in range(1,slip_view.shape[0]):
        cv2.line(im, (int(former_x),int(former_y)), (int(slip_view[i][0]),int(slip_view[i][1])), color, 1)
        former_x = slip_view[i][0]
        former_y = slip_view[i][1]

def process_ord_slip(slip_view):
    slip_view = re.sub('[M]', "", slip_view)
    slip_view = re.sub(',', " ", slip_view)
    slip_view = re.sub('[L]', " ", slip_view)
    ##change the string to list of float
    slip_view = list(map(float, slip_view.split()))# be aware of the diff in python 2 and 3, the return result of map and zip
     ##change the string to list of float
    slip_view = list(map(float, slip_view))# be aware of the diff in python 2 and 3, the return result of map and zip
        ###make tuple pairs
    slip_view = list(zip(slip_view[::2], slip_view[1::2]))
    slip_view = np.array(slip_view)
    #return a 2-d numpy array
    return slip_view



# def error_message():


def main():
    slip_view = 'M348.7393901997488,58.68310024478478L348.55127807757157,59.76129078436702L348.3613965609526,60.88356401569625L348.1696912226979,62.05167295507121L347.97610483258836,63.26746203038101L347.7805771725523,64.53287311086275L347.583044837013,65.84995202051071L347.3834410170052,67.22085558100811L347.18169526650007,68.6478592350954L346.977733249204,70.13336530696144L346.77147646390046,71.67991196263696L346.5628419461845,73.2901829405875L346.35174194418585,74.96701813086642L346.1380835655974,76.71342509043232L345.921768393001,78.532591592728L345.70269206411865,80.42789932154287L345.4807438131999,82.40293883276418L345.25580596928205,84.46152592311971L345.0277534065163,86.60771956273427L344.79645294113,88.84584156862213L344.5617626688823,91.18049821954129L344.3235312360475,93.61660403944731L344.0815970360128,96.15940800769941L343.83578732248355,98.81452248989945L343.5859172290176,101.58795522463515L343.33178868314,104.48614474946154L343.07318920157235,107.51599970541517L342.809890551109,110.68494252467154L342.5416472573299,114.00095808241062L342.268194940588,117.47264798368653L341.98924845547293,121.10929126173116L341.70449980612756,124.92091238883785L341.4136158052689,128.91835764869387L341.11623543938094,133.11338109455806L340.81196689613705,137.51874152696848L340.50038420242663,142.14831217506753L340.1810234121519,147.0172050663453L339.85337827184253,152.14191243209405L339.7757872319575,153.37463498834865L339.3959728938678,152.70579069115468L338.87837230774596,151.83460112505506L338.33375309075683,150.96456898386003L337.7601494532237,150.09593605276203L337.1554006338276,149.22896848389254L336.5171261141342,148.36395989498743L335.8426969535086,147.50123495308372L335.12920251696295,146.64115353419322L334.37341170830166,145.7841155699269L333.5717276199462,144.93056671716792L332.7201342571533,144.0810050186093L331.8141336721758,143.23598876224276L330.84867143207674,142.39614579938166L329.8180478137639,141.562184647071L328.71581143237023,140.73490778669105L327.5346311107306,139.91522768286688L326.26614061395156,139.1041861947976L324.9007492995244,138.30297824883962L323.42740962205687,137.51298090514544L321.8333295701951,136.73578930890488L320.1036141933693,135.97326150680954L318.2208149439935,135.22757478847194L316.16435793958453,134.5012971653306L313.90981141270856,133.79747895436944L311.42793698325204,133.11977138846672L308.68344647593835,132.4725820396155L305.63335184604904,131.8612811119429L302.2247438779601,131.29247914981468L298.39175482318205,130.77440677020076L294.0513323934295,130.31744299998013L289.09724454915386,129.93486480001587L283.39138615047324,129.6439339116343L280.5744344103379,129.54994129930566'

    # slip_view = process_ord_slip(slip_view)

    # translate_pts = project_to_slip()

if __name__ == "__main__":

    im = cv2.imread("slips.png");
    size = im.shape
    main()

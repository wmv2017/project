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

    # (rotation_vector, translation_vector,inliers) = cv2.solvePnPRansac(model_points, image_points, camera_matrix, dist_coeffs[, useExtrinsicGuess[, 100, reprojectionError[, minInliersCount[, inliers[, flags]]]]]]]])
    # print ("Rotation Vector:\n {0}".format(rotation_vector))
    # print ("Translation Vector:\n {0}".format(translation_vector))

    # Project a 3D point (0, 0, 1000.0) onto the image plane.
    #test
    # (img_pts, jacobian) = cv2.projectPoints(model_points, rotation_vector, translation_vector, camera_matrix, dist_coeffs)
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
    slip_view = 'M348.7393901997488,58.68310024478478L348.55127807757157,59.76129078436702L348.3613965609526,60.8835640156962543'

    # slip_view = process_ord_slip(slip_view)

    # translate_pts = project_to_slip()

if __name__ == "__main__":

    im = cv2.imread("slips.png");
    size = im.shape
    main()

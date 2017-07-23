#!/usr/bin/python
# -*- coding:utf-8 -*-
import cv2
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import re
from pnp_withoutinitial import *


def stereo_r_u():

    n = 2
    if n==1:
        img1 = cv2.imread('scene1.png', 0)  # queryimage # left image
        img2 = cv2.imread('scene2.png', 0)  # trainimage # right image
        size = (388, 284)
    else:
        img1 = cv2.imread('keeper.jpg', 0)  # queryimage # left image
        img2 = cv2.imread('slips.jpg', 0)
        size = (630, 354)


    #sift = cv2.SIFT() this should be replaced be the line below
    sift = cv2.xfeatures2d.SIFT_create()

    # find the keypoints and descriptors with SIFT
    kp1, des1 = sift.detectAndCompute(img1,None)
    kp2, des2 = sift.detectAndCompute(img2,None)


    # FLANN parameters
    FLANN_INDEX_KDTREE = 0
    index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
    search_params = dict(checks=50)

    flann = cv2.FlannBasedMatcher(index_params,search_params)
    matches = flann.knnMatch(des1,des2,k=2)

    good = []
    pts1 = []
    pts2 = []

    # ratio test as per Lowe's paper
    for i,(m,n) in enumerate(matches):
        if m.distance < 0.8*n.distance:
            good.append(m)
            pts2.append(kp2[m.trainIdx].pt)
            pts1.append(kp1[m.queryIdx].pt)


    pts1 = np.int32(pts1)
    pts2 = np.int32(pts2)




    #Now we have the list of best matches from both the images. Let’s find the Fundamental Matrix.

    F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_RANSAC, 100, 0.99)
######
    # F, mask = cv2.findFundamentalMat(pts1,pts2,cv2.FM_LMEDS) #LMedS.
    # F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_RANSAC,100, 0.99)
    # F, mask = cv2.findFundamentalMat(pts1, pts2, cv2.FM_8POINT)


    # We select only inlier points
    # pts1 = pts1[mask.ravel()==1]
    # pts2 = pts2[mask.ravel()==1]
    # pts1.shape

    # points1r = pts1.reshape((pts1.shape[0] * 2, 1))
    # points2r = pts2.reshape((pts2.shape[0] * 2, 1))
    # imgSize = (354, 630, 3)
    # retval, H1, H2 = cv2.stereoRectifyUncalibrated(pts1, pts2, F, size,5)
    retval, H1, H2 = cv2.stereoRectifyUncalibrated(pts1, pts2, F, size)

    warp1 = cv2.warpPerspective(img1, H1, size)
    warp2 = cv2.warpPerspective(img2, H2, size)
    plt.subplot(121), plt.imshow(warp1,'gray')
    plt.subplot(122), plt.imshow(warp2,'gray')
    plt.show()

    # return H1, H2
    return None


def return_after_rectify(x,y,matrix):
    caculate_x = (matrix.item(0) * x + matrix.item(1) * y + matrix.item(2)) / (matrix.item(6) * x + matrix.item(7) * y + matrix.item(8))
    caculate_y = (matrix.item(3) * x + matrix.item(4) * y + matrix.item(5)) / (matrix.item(6) * x + matrix.item(7) * y + matrix.item(8))
    return caculate_x,caculate_y

def main():
    in_file = open('3_lines.txt','r')
    line = in_file.readlines()
    # change to 2d array
    k_blue = process_ord_slip(line[3]).T
    k_red = process_ord_slip(line[5]).T
    s_blue = process_ord_slip(line[7]).T
    s_red = process_ord_slip(line[8]).T
    # a  = k_blue.shape

    size = (354, 630, 3)
    focal_length = size[1]
    center = (size[1]/2, size[0]/2)
    camera_matrix = np.array(
                             [[focal_length, 0, center[0]],
                             [0, focal_length, center[1]],
                             [0, 0, 1]], dtype = "double"
                             )

    dist_coeffs = np.zeros((4,1)) # Assuming no lens distortion
    # result = stereo_c(k_blue,s_blue)
    # print(result)
    h1,h2 = stereo_r_u()




    # cv2.triangulatePoints(projMatr1, projMatr2, k_blue, s_blue)


def stereo_c(k_blue,s_blue):
    #can use solvepnp twice to get the T and R respectively.
    imagePoints1 = np.array([[70.0,256.0],[315.0,325.0],[560.0,256.0],[315.0,158.0],[266.0,121.0]]).astype('float32')
    # 3D model points.

    imagePoints2 = np.array([[72.0,243.0],[157.0,283.0],[388.0,258.0],[157.0,183.0],[380.0,146.0]]).astype('float32')

    objectPoints = np.array([[0.0, 1768.0, 0.0],[152.5, 1890.0, 0.0],[305.0, 1768.0, 0.0],[152.5, 1890.0, 71.0],[0.0, 0.0, 0.0]]).astype('float32')

    # Camera internals
    size = (354, 630)
    focal_length = size[1]
    center = (size[1]/2, size[0]/2)
    cameraMatrix1 = cameraMatrix2 = np.array(
                             [[focal_length, 0, center[0]],
                             [0, focal_length, center[1]],
                             [0, 0, 1]], dtype = "double"
                             )

    # print ("Camera Matrix :\n {0}".format(camera_matrix))
    distCoeffs1 = distCoeffs2 = np.zeros((4,1)) # Assuming no lens distortion
    cameraMatrix1 = cameraMatrix2
    # retval, cameraMatrix1, distCoeffs1, rvecs, tvecs = cv2.calibrateCamera([objectPoints], [imagePoints1], (630,354), cameraMatrix1, distCoeffs1)
    retval, cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, R, T, E, F = cv2.stereoCalibrate([objectPoints], [imagePoints1], [imagePoints2], cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, (630,354),flags=cv2.CALIB_FIX_INTRINSIC)
    # # help(cv2.stereoRectify)
    R1, R2, p1, p2, Q, validPixROI1, validPixROI2= cv2.stereoRectify(cameraMatrix1, distCoeffs1, cameraMatrix2, distCoeffs2, (630,354), R, T)
    #
    result = cv2.triangulatePoints(p1, p2, k_blue, s_blue).T
    #
    f_result = cv2.convertPointsFromHomogeneous(result)


    return f_result


if __name__ == '__main__':
    main()


def draft():
    # size = (354, 630)
    # focal_length = size[1]
    # center = (size[1] / 2, size[0] / 2)
    # cameraMatrix = np.array(
    #     [[focal_length, 0, center[0]],
    #      [0, focal_length, center[1]],
    #      [0, 0, 1]], dtype="double"
    # )
    # cameraMatrix_r = np.linalg.inv(cameraMatrix)
    #
    # r1 = np.dot(np.dot(cameraMatrix_r, H1), cameraMatrix)
    # r2 = np.dot(np.dot(cameraMatrix_r, H2), cameraMatrix)
    #
    # distCoeffs = np.zeros((4, 1))  # Assuming no lens distortion
    #
    # mapx1, mapy1 = cv2.initUndistortRectifyMap(cameraMatrix, distCoeffs, r1, cameraMatrix, (630, 354), 5)
    #
    # mapx2, mapy2 = cv2.initUndistortRectifyMap(cameraMatrix, distCoeffs, r2, cameraMatrix, (630, 354), 5)
    #
    # dst = cv2.remap(img2, mapx2, mapy2, cv2.INTER_LINEAR)
    #
    # plt.imshow(dst, 'gray')
    # plt.show()
    #
    #
    # #######
    # imagePoints1 = [[70.0, 256.0], [315.0, 325.0], [560.0, 256.0], [315.0, 158.0], [266.0, 121.0]]
    # imagePoints1 = np.int32(imagePoints1)
    # # 3D model points.
    # imagePoints2 = [[72.0, 243.0], [157.0, 283.0], [388.0, 258.0], [157.0, 183.0], [380.0, 146.0]]
    # imagePoints2 = np.int32(imagePoints2)

    return None

def draw_scatter():
    #
    # plt.subplot(121), plt.imshow(img1, 'gray')
    # for i in range(0, pts1.shape[0]):
    #     plt.scatter(pts1[i][0], pts1[i][1])
    #
    # plt.subplot(122), plt.imshow(img2, 'gray')
    #
    # for i in range(0, pts2.shape[0]):
    #     plt.scatter(pts2[i][0], pts2[i][1])
    # plt.show()
    return None
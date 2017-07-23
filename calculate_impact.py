#!/usr/bin/python
# -*- coding:utf-8 -*-

import re
import numpy as np
import cv2
from shapely.geometry import LineString
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import math
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
from caculatexyz import *
def caculate_speed_M():
    pts1 = np.float32([[54,135.5],[261,135.5],[50,174.5566037735848],[265,174.5566037735848]])
    pts2 = np.float32([[0,0],[305,0],[0,278],[305,278]])

    # pts1 = np.float32([[54,135.5],[261,135.5],[50,174.5566037735848],[43.4,239]])
    # pts2 = np.float32([[0,0],[305,0],[0,278],[0,678]])



    # pts1 = np.float32([[54,135.5],[261,135.5],[50,174.5566037735848],[43.4,239]])
    # pts2 = np.float32([[305,0],[0,0],[305,1490],[305,1090]])


    M = cv2.getPerspectiveTransform(pts1,pts2)
    return M



def caculate_impact_xy(x,y):
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # file_object  = open("points.txt", "w")
    matrix = caculate_speed_M()
    if x > 315:
        x = x - 315

    # a = np.array([[x,y]], dtype='float32')
    # a = np.array([a])
    # result = cv2.perspectiveTransform(a,matrix)
    # return result

    '''
    [[[  3.05000000e+02   2.76398669e-06]]]
[[[  4.64877812e-05   2.35557068e+02]]]
[[[  1.51341572e-13   2.78000000e+02]]]
'''


    caculate_x = (matrix.item(0)*x + matrix.item(1)*y + matrix.item(2))/(matrix.item(6)*x + matrix.item(7)*y + matrix.item(8))
    caculate_y = (matrix.item(3)*x + matrix.item(4)*y + matrix.item(5))/(matrix.item(6)*x + matrix.item(7)*y + matrix.item(8))

    return caculate_x,caculate_y


def main():

    # k,b = caculate_k_b(54,135.5,43.4,239)
    # print(k*50+b)
    print(caculate_impact_xy(261,135.5))

    print(caculate_impact_xy(136.0,155.0))


    print(caculate_impact_xy(50,174.5566037735848))

if __name__ == '__main__':
    main()

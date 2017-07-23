#!/usr/bin/python
# -*- coding:utf-8 -*-
import matplotlib.image as mpimg
import numpy as np
import matplotlib.pyplot as plt


img=mpimg.imread('slips.png')
imgplot = plt.imshow(img)

#
# x1 = [266, 364, 560, 70, 266]# Make x, y arrays for each graph
# y1 = [121, 121, 256, 256, 121]
# plt.plot(x1, y1, color='r')
plt.show()

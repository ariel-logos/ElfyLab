---
layout: post
title: Reshade and FFXI&#58; first setup
thumbnail: img/posts/reshadeboot.png
tags: [FFXI, ReShade]
---

After publishing all the material I developed for ReShade, mostly to be used with FFXI, I thought I had covered most of the things needed to make the presets I provided to work correctly.\
Thanks to a brave user that ventured in the world of the Elfy Lab trying to make a better FFXI, I realized how much I was wrong.
<br>

Soooo, in this post, I'll try to cover the initial setup you should be having before even attempting to run ReShade and everything related that I published or even mentioned. From there, it should be a smooth sail with all the material found around here (hopefully...).
<br><br>
### Files and stuff
Download the following archives and unzip them somewhere (not in the game folder):
<ul>
	<li><b>4GB Patch</b> (author: Thorny)<b>:</b> <a href="/ElfyLab/downloads/4GB Patch.zip" download>Click to Download!</a></li>
	<li><b>DGVoodoo</b> (author: <a href="http://dege.freeweb.hu/" target="_blank">Dege</a>)<b>:</b> <a href="/ElfyLab/downloads/DGVoodoo.zip" download>Click to Download!</a></li>
	<li><b>ReShade with full add-on support: </b><a href="https://reshade.me/" target="_blank">Download from the official website!</a> (usually at the bottom of the homepage...)</li>
	<li><b>One of my ReShade presets:</b> <a href="/ElfyLab/downloads/FFXI_Reshade3_(by_arielfy).ini" download>Click to Download!</a></li>
</ul>
<br>
### Let's begin
##### 4GB Patch

<ol>
<li>Open the <span style="color:MediumSeaGreen;">4GB Patch</span> folder and simply run the executable <span style="color:MediumSeaGreen;">LargeAddressAwarePatcher.exe</span>.</li>
<li>Press the <span style="color:MediumSeaGreen;">Browse</span> button and locate the <span style="color:MediumSeaGreen;">pol.exe</span> file <span style="color:DeepPink;">you want</span> (&#42;wink-wink&#42;) to patch.</li>
<li>Click on <span style="color:MediumSeaGreen;">Patch</span> and if everything goes well you should receive a "success" message.</li>
<li>You can now close the patcher and, if you wish, also get rid of the 4GB Patch folder.</li>
</ol>
##### DPI scaling
<ol>
<li>Use your File Explorer to open the folder where the pol.exe you just patched is located.</li>
<li>Right click it and select <span style="color:MediumSeaGreen;">Properties</span>.</li>
<li>In the window that opens up, move to the <span style="color:MediumSeaGreen;">Compatibility</span> tab, then, click on <span style="color:MediumSeaGreen;">Change high DPI settings</span> and, in the new window, make sure the checkbox <span style="color:MediumSeaGreen;">Override high DPI scaling behavior</span> is ticked and the <span style="color:MediumSeaGreen;">Scaling performed by</span> is set to <span style="color:MediumSeaGreen;">Application</span>.<br><br></li>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/dpisettings.png" style="max-height: 450px;"/>
</div>
</ol>
##### DGVoodoo
<ol>
<li>Copy and paste all the files in the <span style="color:MediumSeaGreen;">DGVoodoo</span> folder in the same directory where the pol.exe you just modified is located.</li>
<li>Run the <span style="color:MediumSeaGreen;">dgVoodooCpl.exe</span> executable.</li>
<li>If you successfully pasted all the files from the DGVoodoo folder you should already have everything setup as it should be.</li>
<li>Check in the picture below that, the highlighted settings, are the same as those you see in your DGVoodoo window. Goes without saying that, in the  <span style="color:MediumSeaGreen;">Adapter(s)</span> dropdown, you should have your main GPU selected.<br><br></li>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/dgvoodoo.png" style="max-height: 350px;"/>
</div><br>
<li>You can now close the DGVoodoo window and again, if you wish, get rid of the original folder (just don't delete the files you pasted in the pol.exe folder!!!)</li>
</ol>
##### ReShade
<ol>
<li>Copy and paste the <span style="color:MediumSeaGreen;">preset</span> you downloaded previously (it's the <span style="color:MediumSeaGreen;">.ini</span> file) in the pol.exe folder.</li>
<li>Open the ReShade installer. You should be greeted with a warning message about this version of ReShade being intended for single-player games only. (Read more about this in the <span style="color:#ee2222;">Important</span> section <a href="https://ariel-logos.github.io/ElfyLab/ffxireshadepreset/" target="_blank">here</a>).</li>
<li>In the new window, you should be asked to select a game or application. Once again, use the <span style="color:MediumSeaGreen;">Browse</span> button to locate and select the <span style="color:MediumSeaGreen;">pol.exe</span> file.</li>
<li>In the next window, you are asked to select the rendering API. Choose the <span style="color:MediumSeaGreen;">Microsoft DirectX 10/11/12</span> option.</li>
<li>In the next window, you are asked to select a preset to install. <span style="color:MediumSeaGreen;">Browse</span> and select the <span style="color:MediumSeaGreen;">preset</span> from the first step that should be now in your pol.exe folder.</li>
<li>In the next window, you should see a bunch of stuff already selected. These are the effects that you'll need to properly run the preseted you selected in the previous step.<br>If you want to add more or remove some, you can come back to this window later be re-running the installer and picking the "Modify" option after re-selecting the pol.exe as the target application.<br>For now, click <span style="color:MediumSeaGreen;">Next</span> and patiently wait for all the effects to be downloaded. After everything is done you should have this window on your screen.<br><br></li>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/reshadeinstall.png" style="max-height: 400px;"/>
</div><br>
<li>Click on <span style="color:MediumSeaGreen;">Finish</span> and finally start your game.</li>
<li>The moment of truth! 😶 If everything up to this point has been successful, you should see, at the top of your game window, an overlay message from ReShade.<br><br></li>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/reshadeboot.png" style="max-height: 450px;"/>
</div><br>
<li>Congratulations! 🎉 The "hard" part is done and you can now enjoy the rest of the material I published or go on your own journey with ReShade effects!</li>
<li>Last notes:
<ul>
<li> If this is your first ReShade installation your hotkey to open the ReShade overlay is likely the <span style="color:MediumSeaGreen;">Home</span> key.</li>
<li> If you are using my presets, I highly recomment to navigate to the <span style="color:MediumSeaGreen;">Settings</span> tab and enable the <span style="color:MediumSeaGreen;">Load only enabled effects</span> option.</li>
<li>Remember that having <span style="color:MediumSeaGreen;">Performance Mode</span> enabled in the <span style="color:MediumSeaGreen;">Home</span> tab (the one with the list of all effects) really improves performances.</li>
</ul>
</li>
</ol>
<br>
### Wrapping things up
I hope you found this guide useful and, in retrospective, this should have been the first post in the "ReShade and FFXI" series. But here we are... 😅\
Otherwise, if this is the first post in the Elfy Lab where you landed, welcome, and please have a look around to know more about advanced setup for these presets!
Meanwhile, have fun! ❤️


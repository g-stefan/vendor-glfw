// Created by Grigore Stefan <g_stefan@yahoo.com>
// Public domain (Unlicense) <http://unlicense.org>
// SPDX-FileCopyrightText: 2022 Grigore Stefan <g_stefan@yahoo.com>
// SPDX-License-Identifier: Unlicense

Fabricare.include("vendor");

messageAction("make");

if (Shell.fileExists("temp/build.done.flag")) {
	return;
};

if (!Shell.directoryExists("source")) {
	exitIf(Shell.system("7z x -aoa archive/" + Project.vendor + ".7z"));
	Shell.rename(Project.vendor, "source");
};

Shell.mkdirRecursivelyIfNotExists("output");
Shell.mkdirRecursivelyIfNotExists("output/bin");
Shell.mkdirRecursivelyIfNotExists("output/include");
Shell.mkdirRecursivelyIfNotExists("output/lib");
Shell.mkdirRecursivelyIfNotExists("temp");

Shell.mkdirRecursivelyIfNotExists("temp/cmake");

if (!Shell.fileExists("temp/build.config.flag")) {
	Shell.copyFile("fabricare/CMakeLists.txt","source/CMakeLists.txt");

	Shell.setenv("CC","cl.exe");
	Shell.setenv("CXX","cl.exe");

	cmdConfig="cmake";
	cmdConfig+=" ../../source";
	cmdConfig+=" -G \"Ninja\"";
	cmdConfig+=" -DCMAKE_BUILD_TYPE=Release";
	cmdConfig+=" -DCMAKE_INSTALL_PREFIX="+Shell.realPath(Shell.getcwd())+"\\output";

	runInPath("temp/cmake",function(){
		exitIf(Shell.system(cmdConfig));
	});

	Shell.filePutContents("temp/build.config.flag", "done");
};

runInPath("temp/cmake",function(){
	exitIf(Shell.system("ninja"));
	exitIf(Shell.system("ninja install"));
	exitIf(Shell.system("ninja clean"));
});

var compileProject = {
	"project" : "glad_gl",
	"includePath" : [ 
		"output/include",
		"source",
		"source/deps"
	],
	"cSource" : [ "source/deps/glad_gl.c" ]
};

compileLib(compileProject);

var compileProject = {
	"project" : "glad_vulkan",
	"includePath" : [ 
		"output/include",
		"source",
		"source/deps"
	],
	"cSource" : [ "source/deps/glad_vulkan.c" ]
};

compileLib(compileProject);

Shell.copyFilesToDirectory("source/deps/glad/*","output/include/glad");

Shell.filePutContents("temp/build.done.flag", "done");


layout.buildDirectory = file(System.getProperty("user.home") + "/.gradle-build/${rootProject.name}")

plugins {
    kotlin("multiplatform") version "2.1.10"
    id("application")   // Just for prototyping purpose, will be removed later
}

kotlin {
    jvm {
        withJava()  // Just for prototyping purpose, will be removed later
    }
    js {
        browser() // Adding browser target as specified in design.md
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")
            }
        }
        val commonTest by getting {
            dependencies {
                implementation(kotlin("test"))
                implementation(kotlin("test-common"))
                implementation(kotlin("test-annotations-common"))
            }
        }
        val jvmMain by getting {
            dependencies {
                // JVM-specific dependencies here
            }
        }
        val jvmTest by getting {
            dependencies {
                implementation(kotlin("test-junit"))
            }
        }
        val jsTest by getting {
            dependencies {
                implementation(kotlin("test-js"))
            }
        }
    }
}

application {
    mainClass.set("ai.brainstorm.AppKt")
}

// Configure run task to enable console input
tasks.named<JavaExec>("run") {
    standardInput = System.`in`
}

repositories {
    mavenCentral()
}
